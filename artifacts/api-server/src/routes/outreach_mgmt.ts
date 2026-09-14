import { Router, type IRouter } from "express";
import {
  db,
  outreachRecordsTable,
  providersTable,
  appSettingsTable,
  auditEventsTable,
  procurementRecordsTable,
} from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";

const router: IRouter = Router();

async function getSetting(key: string) {
  const [row] = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, key));
  return row?.value || "";
}

async function sendEmailPayload(payload: any) {
  const provider = await getSetting("emailProvider");
  const apiKey = await getSetting("emailApiKey");
  const endpoint = await getSetting("emailEndpoint");
  const from = await getSetting("emailFromAddress");
  if (!provider || !apiKey || !endpoint || !from) return { delivered: false, provider: provider || "unconfigured", message: "Email provider credentials are not configured." };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: payload.to, subject: payload.subject, text: payload.body, html: payload.html || payload.body }),
  });
  return { delivered: response.ok, provider, status: response.status, responseText: await response.text() };
}

async function sendFaxPayload(payload: any) {
  const provider = await getSetting("faxProvider");
  const apiKey = await getSetting("faxApiKey");
  const endpoint = await getSetting("faxEndpoint");
  if (!provider || !apiKey || !endpoint) return { delivered: false, provider: provider || "unconfigured", message: "Fax provider credentials are not configured." };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to: payload.to, subject: payload.subject, text: payload.body, documentUrl: payload.documentUrl }),
  });
  return { delivered: response.ok, provider, status: response.status, responseText: await response.text() };
}

const procurementRank: Record<string, number> = {
  "Need Identified": 0,
  Prospecting: 1,
  "In Contact": 2,
  Evaluating: 3,
  "Pricing Secured": 4,
  "Agreement Pending": 5,
  "Final Review": 6,
  "Activated / Live": 7,
  "Lost / Not Viable": 8,
};

function procurementTargetForOutreach(status: string | null | undefined) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "received") return { stage: "Evaluating", waitingOn: "Occu-Med evaluation", nextAction: "Review provider response and secure pricing/terms" };
  if (normalized === "signed") return { stage: "Final Review", waitingOn: "Occu-Med finalization", nextAction: "Complete onboarding and activate provider" };
  if (normalized === "sent" || normalized === "follow_up") return { stage: "In Contact", waitingOn: "Provider response", nextAction: "Follow up with provider" };
  if (normalized === "declined") return { stage: "Lost / Not Viable", waitingOn: null, nextAction: "Document dead end or replacement target" };
  return null;
}

async function syncProcurementFromOutreach(record: typeof outreachRecordsTable.$inferSelect) {
  const target = procurementTargetForOutreach(record.status);
  if (!target) return;

  let existing = record.providerId
    ? (await db.select().from(procurementRecordsTable).where(eq(procurementRecordsTable.providerId, record.providerId)).orderBy(desc(procurementRecordsTable.updatedAt)).limit(1))[0]
    : undefined;

  if (!existing && record.providerName) {
    existing = (await db.select().from(procurementRecordsTable).where(eq(procurementRecordsTable.providerName, record.providerName)).orderBy(desc(procurementRecordsTable.updatedAt)).limit(1))[0];
  }

  const status = String(record.status || "").toLowerCase();
  if (!existing) {
    if (!["received", "signed"].includes(status)) return;
    const provider = record.providerId
      ? (await db.select().from(providersTable).where(eq(providersTable.id, record.providerId)).limit(1))[0]
      : undefined;
    const [created] = await db.insert(procurementRecordsTable).values({
      providerId: record.providerId || null,
      providerName: record.providerName || provider?.clinicName || `Outreach #${record.id}`,
      city: record.providerCity || provider?.city || null,
      state: record.providerState || provider?.state || null,
      serviceCategory: provider?.servicesOffered || null,
      stage: target.stage,
      waitingOn: target.waitingOn,
      nextAction: target.nextAction,
      lastTouchAt: new Date(),
      followUpDate: record.followUpDate || null,
      notes: `Created automatically from outreach record #${record.id}.`,
    }).returning();
    await db.insert(auditEventsTable).values({
      entityType: "procurement_record",
      entityId: created.id,
      action: "created_from_outreach",
      summary: `${created.providerName} entered procurement from ${record.status} outreach`,
      afterJson: JSON.stringify(created),
      actor: "system",
    });
    return;
  }

  const currentRank = procurementRank[existing.stage] ?? 0;
  const targetRank = procurementRank[target.stage] ?? currentRank;
  if (existing.stage === "Activated / Live" && target.stage !== "Lost / Not Viable") return;
  if (target.stage !== "Lost / Not Viable" && targetRank < currentRank) return;

  const [updated] = await db.update(procurementRecordsTable).set({
    stage: target.stage,
    waitingOn: target.waitingOn,
    nextAction: target.nextAction,
    lastTouchAt: new Date(),
    followUpDate: record.followUpDate || existing.followUpDate,
    lostAt: target.stage === "Lost / Not Viable" ? new Date() : existing.lostAt,
  }).where(eq(procurementRecordsTable.id, existing.id)).returning();

  await db.insert(auditEventsTable).values({
    entityType: "procurement_record",
    entityId: updated.id,
    action: existing.stage === updated.stage ? "synced_from_outreach" : "stage_changed_from_outreach",
    summary: existing.stage === updated.stage
      ? `${updated.providerName} procurement activity synced from outreach`
      : `${updated.providerName}: ${existing.stage} → ${updated.stage} from outreach`,
    beforeJson: JSON.stringify(existing),
    afterJson: JSON.stringify(updated),
    actor: "system",
  });
}

router.get("/outreach", async (req, res): Promise<void> => {
  const { type, status, overdue } = req.query as Record<string, string>;
  const conditions = [];
  if (type) conditions.push(eq(outreachRecordsTable.outreachType, type));
  if (status) conditions.push(eq(outreachRecordsTable.status, status));
  if (overdue === "true") conditions.push(sql`${outreachRecordsTable.status} = 'sent' AND ${outreachRecordsTable.sentAt} < NOW() - INTERVAL '7 days'`);
  const records = await db.select().from(outreachRecordsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(desc(outreachRecordsTable.createdAt));
  res.json(records);
});

router.get("/outreach/stats", async (_req, res): Promise<void> => {
  const [total, sent, received, signed, overdue] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable),
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable).where(eq(outreachRecordsTable.status, "sent")),
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable).where(eq(outreachRecordsTable.status, "received")),
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable).where(eq(outreachRecordsTable.status, "signed")),
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable).where(sql`${outreachRecordsTable.status} = 'sent' AND ${outreachRecordsTable.sentAt} < NOW() - INTERVAL '7 days'`),
  ]);
  res.json({ total: total[0]?.count ?? 0, sent: sent[0]?.count ?? 0, received: received[0]?.count ?? 0, signed: signed[0]?.count ?? 0, overdue: overdue[0]?.count ?? 0 });
});

router.get("/outreach/provider/:providerId", async (req, res): Promise<void> => {
  const providerId = Number(req.params.providerId);
  if (!Number.isFinite(providerId) || providerId <= 0) { res.status(400).json({ error: "Invalid provider id" }); return; }
  const records = await db.select().from(outreachRecordsTable).where(eq(outreachRecordsTable.providerId, providerId)).orderBy(desc(outreachRecordsTable.createdAt));
  res.json(records);
});

router.post("/outreach/send-email", async (req, res): Promise<void> => {
  const providerId = Number(req.body?.providerId);
  const to = String(req.body?.to || "").trim();
  const subject = String(req.body?.subject || "").trim();
  const body = String(req.body?.body || "").trim();
  if (!to || !subject || !body) { res.status(400).json({ error: "to, subject, and body are required" }); return; }
  const [provider] = providerId ? await db.select().from(providersTable).where(eq(providersTable.id, providerId)) : [null];
  const delivery = await sendEmailPayload({ to, subject, body });
  const [record] = await db.insert(outreachRecordsTable).values({
    providerId: provider?.id,
    providerName: provider?.clinicName || String(req.body?.providerName || to),
    providerCity: provider?.city,
    providerState: provider?.state,
    providerEmail: provider?.email,
    providerFax: provider?.fax,
    outreachType: "email",
    templateName: String(req.body?.templateName || "Manual Email"),
    subject,
    body,
    recipientEmail: to,
    status: delivery.delivered ? "sent" : "draft",
    notes: delivery.delivered ? `Sent via ${delivery.provider}` : `Not delivered: ${delivery.message || delivery.responseText || "provider error"}`,
  }).returning();
  await db.insert(auditEventsTable).values({ entityType: "outreach_record", entityId: record.id, action: delivery.delivered ? "email_sent" : "email_send_failed", summary: delivery.delivered ? `Email sent to ${to}` : `Email delivery failed or unconfigured for ${to}`, afterJson: JSON.stringify({ record, delivery }), actor: "current-user" });
  res.status(delivery.delivered ? 201 : 202).json({ record, delivery });
});

router.post("/outreach/send-fax", async (req, res): Promise<void> => {
  const providerId = Number(req.body?.providerId);
  const to = String(req.body?.to || "").trim();
  const subject = String(req.body?.subject || "Fax Outreach").trim();
  const body = String(req.body?.body || "").trim();
  if (!to || !body) { res.status(400).json({ error: "to and body are required" }); return; }
  const [provider] = providerId ? await db.select().from(providersTable).where(eq(providersTable.id, providerId)) : [null];
  const delivery = await sendFaxPayload({ to, subject, body, documentUrl: req.body?.documentUrl });
  const [record] = await db.insert(outreachRecordsTable).values({
    providerId: provider?.id,
    providerName: provider?.clinicName || String(req.body?.providerName || to),
    providerCity: provider?.city,
    providerState: provider?.state,
    providerEmail: provider?.email,
    providerFax: provider?.fax,
    outreachType: "fax",
    templateName: String(req.body?.templateName || "Manual Fax"),
    subject,
    body,
    recipientFax: to,
    status: delivery.delivered ? "sent" : "draft",
    notes: delivery.delivered ? `Sent via ${delivery.provider}` : `Not delivered: ${delivery.message || delivery.responseText || "provider error"}`,
  }).returning();
  await db.insert(auditEventsTable).values({ entityType: "outreach_record", entityId: record.id, action: delivery.delivered ? "fax_sent" : "fax_send_failed", summary: delivery.delivered ? `Fax sent to ${to}` : `Fax delivery failed or unconfigured for ${to}`, afterJson: JSON.stringify({ record, delivery }), actor: "current-user" });
  res.status(delivery.delivered ? 201 : 202).json({ record, delivery });
});

router.post("/outreach", async (req, res): Promise<void> => {
  const { records } = req.body as { records: Array<Record<string, unknown>> };
  if (!records || !Array.isArray(records) || records.length === 0) { res.status(400).json({ error: "records array required" }); return; }
  const inserted = await db.insert(outreachRecordsTable).values(records.map((record) => ({
    providerId: record.providerId as number | undefined,
    providerName: record.providerName as string,
    providerCity: record.providerCity as string | undefined,
    providerState: record.providerState as string | undefined,
    providerEmail: record.providerEmail as string | undefined,
    providerFax: record.providerFax as string | undefined,
    outreachType: (record.outreachType as string) || "email",
    templateName: record.templateName as string | undefined,
    subject: record.subject as string | undefined,
    body: record.body as string | undefined,
    recipientEmail: record.recipientEmail as string | undefined,
    recipientFax: record.recipientFax as string | undefined,
    status: (record.status as string) || "sent",
    followUpDate: record.followUpDate ? new Date(record.followUpDate as string) : undefined,
    notes: record.notes as string | undefined,
  }))).returning();
  await Promise.all(inserted.map(syncProcurementFromOutreach));
  res.status(201).json(inserted);
});

router.patch("/outreach/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { status, notes, receivedAt, followUpDate } = req.body;
  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (receivedAt !== undefined) updates.receivedAt = receivedAt ? new Date(receivedAt) : null;
  if (followUpDate !== undefined) updates.followUpDate = followUpDate ? new Date(followUpDate) : null;
  if (status === "received" && !receivedAt) updates.receivedAt = new Date();
  if (status === "signed" && !receivedAt) updates.receivedAt = new Date();
  const [updated] = await db.update(outreachRecordsTable).set(updates).where(eq(outreachRecordsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Record not found" }); return; }
  await syncProcurementFromOutreach(updated);
  res.json(updated);
});

router.delete("/outreach/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(outreachRecordsTable).where(eq(outreachRecordsTable.id, id));
  res.status(204).send();
});

router.get("/outreach/providers-for-outreach", async (_req, res): Promise<void> => {
  const providers = await db.select({
    id: providersTable.id,
    clinicName: providersTable.clinicName,
    city: providersTable.city,
    state: providersTable.state,
    email: providersTable.email,
    fax: providersTable.fax,
    phone: providersTable.phone,
    contactPerson: providersTable.contactPerson,
    servicesOffered: providersTable.servicesOffered,
    verificationStatus: providersTable.verificationStatus,
    tpaFriendlyClues: providersTable.tpaFriendlyClues,
    website: providersTable.website,
  }).from(providersTable).orderBy(sql`${providersTable.clinicName} ASC`);
  res.json(providers);
});

export default router;
