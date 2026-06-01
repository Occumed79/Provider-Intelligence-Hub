import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { currencyFeeSchedulesTable, auditEventsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/currency-fee-schedules", async (_req, res): Promise<void> => {
  const rows = await db.select().from(currencyFeeSchedulesTable).orderBy(desc(currencyFeeSchedulesTable.updatedAt));
  res.json(rows.map((row) => ({ ...row, rows: JSON.parse(row.rowsJson || "[]") })));
});

router.post("/currency-fee-schedules", async (req, res): Promise<void> => {
  const { name, currency, usdRate, rows, notes } = req.body || {};
  if (!name || !currency || !usdRate || !Array.isArray(rows)) { res.status(400).json({ error: "name, currency, usdRate, and rows are required" }); return; }
  const [created] = await db.insert(currencyFeeSchedulesTable).values({ name: String(name), currency: String(currency), usdRate: String(usdRate), rowsJson: JSON.stringify(rows), notes: notes ? String(notes) : undefined }).returning();
  await db.insert(auditEventsTable).values({ entityType: "currency_fee_schedule", entityId: created.id, action: "schedule_created", summary: `Currency fee schedule created: ${created.name}`, afterJson: JSON.stringify(created), actor: "current-user" });
  res.status(201).json({ ...created, rows });
});

router.patch("/currency-fee-schedules/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [before] = await db.select().from(currencyFeeSchedulesTable).where(eq(currencyFeeSchedulesTable.id, id));
  if (!before) { res.status(404).json({ error: "Schedule not found" }); return; }
  const updates: Record<string, unknown> = {};
  if (req.body?.name !== undefined) updates.name = String(req.body.name);
  if (req.body?.currency !== undefined) updates.currency = String(req.body.currency);
  if (req.body?.usdRate !== undefined) updates.usdRate = String(req.body.usdRate);
  if (req.body?.rows !== undefined) updates.rowsJson = JSON.stringify(req.body.rows);
  if (req.body?.notes !== undefined) updates.notes = req.body.notes ? String(req.body.notes) : null;
  const [updated] = await db.update(currencyFeeSchedulesTable).set(updates).where(eq(currencyFeeSchedulesTable.id, id)).returning();
  await db.insert(auditEventsTable).values({ entityType: "currency_fee_schedule", entityId: id, action: "schedule_updated", summary: `Currency fee schedule updated: ${updated.name}`, beforeJson: JSON.stringify(before), afterJson: JSON.stringify(updated), actor: "current-user" });
  res.json({ ...updated, rows: JSON.parse(updated.rowsJson || "[]") });
});

router.delete("/currency-fee-schedules/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [before] = await db.select().from(currencyFeeSchedulesTable).where(eq(currencyFeeSchedulesTable.id, id));
  await db.delete(currencyFeeSchedulesTable).where(eq(currencyFeeSchedulesTable.id, id));
  await db.insert(auditEventsTable).values({ entityType: "currency_fee_schedule", entityId: id, action: "schedule_deleted", summary: `Currency fee schedule deleted: ${before?.name || id}`, beforeJson: before ? JSON.stringify(before) : undefined, actor: "current-user" });
  res.status(204).send();
});

export default router;
