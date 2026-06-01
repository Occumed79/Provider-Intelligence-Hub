import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { outreachRecordsTable, providersTable } from "@workspace/db";
import { eq, sql, and, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/outreach", async (req, res): Promise<void> => {
  const { type, status, overdue } = req.query as Record<string, string>;

  const conditions = [];
  if (type) conditions.push(eq(outreachRecordsTable.outreachType, type));
  if (status) conditions.push(eq(outreachRecordsTable.status, status));
  if (overdue === "true") {
    conditions.push(
      sql`${outreachRecordsTable.status} = 'sent' AND ${outreachRecordsTable.sentAt} < NOW() - INTERVAL '7 days'`,
    );
  }

  const records = await db
    .select()
    .from(outreachRecordsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(outreachRecordsTable.createdAt));

  res.json(records);
});

router.get("/outreach/stats", async (_req, res): Promise<void> => {
  const [total, sent, received, signed, overdue] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable),
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable).where(eq(outreachRecordsTable.status, "sent")),
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable).where(eq(outreachRecordsTable.status, "received")),
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable).where(eq(outreachRecordsTable.status, "signed")),
    db.select({ count: sql<number>`count(*)` }).from(outreachRecordsTable).where(
      sql`${outreachRecordsTable.status} = 'sent' AND ${outreachRecordsTable.sentAt} < NOW() - INTERVAL '7 days'`,
    ),
  ]);

  res.json({ total: total[0]?.count ?? 0, sent: sent[0]?.count ?? 0, received: received[0]?.count ?? 0, signed: signed[0]?.count ?? 0, overdue: overdue[0]?.count ?? 0 });
});

router.get("/outreach/provider/:providerId", async (req, res): Promise<void> => {
  const providerId = Number(req.params.providerId);
  if (!Number.isFinite(providerId) || providerId <= 0) {
    res.status(400).json({ error: "Invalid provider id" });
    return;
  }

  const records = await db
    .select()
    .from(outreachRecordsTable)
    .where(eq(outreachRecordsTable.providerId, providerId))
    .orderBy(desc(outreachRecordsTable.createdAt));

  res.json(records);
});

router.post("/outreach", async (req, res): Promise<void> => {
  const { records } = req.body as { records: Array<Record<string, unknown>> };
  if (!records || !Array.isArray(records) || records.length === 0) { res.status(400).json({ error: "records array required" }); return; }
  const inserted = await db.insert(outreachRecordsTable).values(records.map((r) => ({ providerId: r.providerId as number | undefined, providerName: r.providerName as string, providerCity: r.providerCity as string | undefined, providerState: r.providerState as string | undefined, providerEmail: r.providerEmail as string | undefined, providerFax: r.providerFax as string | undefined, outreachType: (r.outreachType as string) || "email", templateName: r.templateName as string | undefined, subject: r.subject as string | undefined, body: r.body as string | undefined, recipientEmail: r.recipientEmail as string | undefined, recipientFax: r.recipientFax as string | undefined, status: (r.status as string) || "sent", followUpDate: r.followUpDate ? new Date(r.followUpDate as string) : undefined, notes: r.notes as string | undefined }))).returning();
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
  res.json(updated);
});

router.delete("/outreach/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(outreachRecordsTable).where(eq(outreachRecordsTable.id, id));
  res.status(204).send();
});

router.get("/outreach/providers-for-outreach", async (_req, res): Promise<void> => {
  const providers = await db.select({ id: providersTable.id, clinicName: providersTable.clinicName, city: providersTable.city, state: providersTable.state, email: providersTable.email, fax: providersTable.fax, phone: providersTable.phone, contactPerson: providersTable.contactPerson, servicesOffered: providersTable.servicesOffered, verificationStatus: providersTable.verificationStatus, tpaFriendlyClues: providersTable.tpaFriendlyClues, website: providersTable.website }).from(providersTable).orderBy(sql`${providersTable.clinicName} ASC`);
  res.json(providers);
});

export default router;
