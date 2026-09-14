import { Router, type IRouter } from "express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  PROCUREMENT_STAGES,
  procurementRecordsTable,
  providersTable,
  auditEventsTable,
} from "@workspace/db";

const router: IRouter = Router();
const stageSet = new Set<string>(PROCUREMENT_STAGES);

function asOptionalText(value: unknown) {
  if (value === undefined) return undefined;
  const text = String(value ?? "").trim();
  return text || null;
}

function asOptionalDate(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeStage(value: unknown) {
  const stage = String(value ?? "Need Identified").trim();
  return stageSet.has(stage) ? stage : null;
}

router.get("/procurement", async (req, res): Promise<void> => {
  const stage = typeof req.query.stage === "string" ? req.query.stage : "";
  const owner = typeof req.query.owner === "string" ? req.query.owner : "";
  const conditions = [];
  if (stage && stageSet.has(stage)) conditions.push(eq(procurementRecordsTable.stage, stage));
  if (owner) conditions.push(eq(procurementRecordsTable.owner, owner));

  const records = await db
    .select()
    .from(procurementRecordsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(procurementRecordsTable.stage), desc(procurementRecordsTable.updatedAt));
  res.json(records);
});

router.get("/procurement/summary", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ stage: procurementRecordsTable.stage, count: sql<number>`count(*)` })
    .from(procurementRecordsTable)
    .groupBy(procurementRecordsTable.stage);

  const byStage = Object.fromEntries(PROCUREMENT_STAGES.map((stage) => [stage, 0]));
  rows.forEach((row) => {
    if (row.stage in byStage) byStage[row.stage] = Number(row.count || 0);
  });

  const [overdue] = await db
    .select({ count: sql<number>`count(*)` })
    .from(procurementRecordsTable)
    .where(sql`${procurementRecordsTable.followUpDate} < NOW() AND ${procurementRecordsTable.stage} NOT IN ('Activated / Live', 'Lost / Not Viable')`);

  res.json({ byStage, overdue: Number(overdue?.count || 0) });
});

router.post("/procurement", async (req, res): Promise<void> => {
  const providerId = req.body?.providerId ? Number(req.body.providerId) : null;
  const provider = providerId
    ? (await db.select().from(providersTable).where(eq(providersTable.id, providerId)))[0]
    : null;
  const providerName = String(req.body?.providerName || provider?.clinicName || "").trim();
  if (!providerName) {
    res.status(400).json({ error: "providerName is required" });
    return;
  }

  const stage = normalizeStage(req.body?.stage);
  if (!stage) {
    res.status(400).json({ error: "Invalid procurement stage" });
    return;
  }

  const now = new Date();
  const [record] = await db.insert(procurementRecordsTable).values({
    providerId: provider?.id || null,
    providerName,
    city: asOptionalText(req.body?.city) ?? provider?.city ?? null,
    state: asOptionalText(req.body?.state) ?? provider?.state ?? null,
    country: asOptionalText(req.body?.country),
    serviceCategory: asOptionalText(req.body?.serviceCategory) ?? provider?.servicesOffered ?? null,
    stage,
    owner: asOptionalText(req.body?.owner),
    waitingOn: asOptionalText(req.body?.waitingOn),
    lastTouchAt: asOptionalDate(req.body?.lastTouchAt) ?? now,
    nextAction: asOptionalText(req.body?.nextAction),
    followUpDate: asOptionalDate(req.body?.followUpDate),
    activatedAt: stage === "Activated / Live" ? now : null,
    lostAt: stage === "Lost / Not Viable" ? now : null,
    notes: asOptionalText(req.body?.notes),
  }).returning();

  await db.insert(auditEventsTable).values({
    entityType: "procurement_record",
    entityId: record.id,
    action: "created",
    summary: `${record.providerName} entered procurement at ${record.stage}`,
    afterJson: JSON.stringify(record),
    actor: "current-user",
  });

  res.status(201).json(record);
});

router.patch("/procurement/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [before] = await db.select().from(procurementRecordsTable).where(eq(procurementRecordsTable.id, id));
  if (!before) {
    res.status(404).json({ error: "Procurement record not found" });
    return;
  }

  const updates: Record<string, unknown> = {};
  const textFields = ["providerName", "city", "state", "country", "serviceCategory", "owner", "waitingOn", "nextAction", "notes"] as const;
  textFields.forEach((field) => {
    if (req.body?.[field] !== undefined) updates[field] = asOptionalText(req.body[field]);
  });

  if (req.body?.stage !== undefined) {
    const stage = normalizeStage(req.body.stage);
    if (!stage) {
      res.status(400).json({ error: "Invalid procurement stage" });
      return;
    }
    updates.stage = stage;
    if (stage === "Activated / Live" && before.stage !== "Activated / Live") updates.activatedAt = new Date();
    if (stage !== "Activated / Live" && before.stage === "Activated / Live") updates.activatedAt = null;
    if (stage === "Lost / Not Viable" && before.stage !== "Lost / Not Viable") updates.lostAt = new Date();
    if (stage !== "Lost / Not Viable" && before.stage === "Lost / Not Viable") updates.lostAt = null;
  }

  ["lastTouchAt", "followUpDate", "activatedAt", "lostAt"].forEach((field) => {
    if (req.body?.[field] !== undefined) updates[field] = asOptionalDate(req.body[field]);
  });

  const [record] = await db
    .update(procurementRecordsTable)
    .set(updates)
    .where(eq(procurementRecordsTable.id, id))
    .returning();

  await db.insert(auditEventsTable).values({
    entityType: "procurement_record",
    entityId: id,
    action: before.stage !== record.stage ? "stage_changed" : "updated",
    summary: before.stage !== record.stage
      ? `${record.providerName}: ${before.stage} → ${record.stage}`
      : `${record.providerName} procurement record updated`,
    beforeJson: JSON.stringify(before),
    afterJson: JSON.stringify(record),
    actor: "current-user",
  });

  res.json(record);
});

router.delete("/procurement/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db.delete(procurementRecordsTable).where(eq(procurementRecordsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Procurement record not found" });
    return;
  }
  res.status(204).send();
});

export default router;
