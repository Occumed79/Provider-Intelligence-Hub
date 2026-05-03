import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { providersTable, evidenceFilesTable, reviewItemsTable, extractedFieldsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import {
  GetProviderParams,
  UpdateProviderParams,
  UpdateProviderBody,
  CreateProviderBody,
  ListProvidersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/providers/map", async (req, res): Promise<void> => {
  const providers = await db
    .select()
    .from(providersTable)
    .where(sql`${providersTable.latitude} IS NOT NULL AND ${providersTable.longitude} IS NOT NULL`);

  res.json(
    providers.map((p) => ({
      id: p.id,
      clinicName: p.clinicName,
      city: p.city,
      state: p.state,
      address: p.address,
      latitude: p.latitude!,
      longitude: p.longitude!,
      verificationStatus: p.verificationStatus,
      servicesOffered: p.servicesOffered,
      clinicType: p.clinicType,
    })),
  );
});

router.get("/providers/states-coverage", async (req, res): Promise<void> => {
  const providers = await db
    .select({
      state: providersTable.state,
    })
    .from(providersTable)
    .where(sql`${providersTable.state} IS NOT NULL`);

  const evidenceFiles = await db
    .select({
      state: evidenceFilesTable.associatedState,
    })
    .from(evidenceFilesTable)
    .where(sql`${evidenceFilesTable.associatedState} IS NOT NULL`);

  const stateCounts: Record<string, { providers: number; evidence: number; mapped: number }> = {};

  for (const p of providers) {
    const s = p.state!;
    if (!stateCounts[s]) stateCounts[s] = { providers: 0, evidence: 0, mapped: 0 };
    stateCounts[s].providers++;
  }

  for (const e of evidenceFiles) {
    const s = e.state!;
    if (!stateCounts[s]) stateCounts[s] = { providers: 0, evidence: 0, mapped: 0 };
    stateCounts[s].evidence++;
  }

  const result = Object.entries(stateCounts).map(([state, counts]) => ({
    state,
    providerCount: counts.providers,
    evidenceCount: counts.evidence,
    mappedCount: counts.mapped,
  }));

  res.json(result);
});

router.get("/providers", async (req, res): Promise<void> => {
  const params = ListProvidersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.state) {
    conditions.push(sql`${providersTable.state} ILIKE ${params.data.state}`);
  }
  if (params.data.city) {
    conditions.push(sql`${providersTable.city} ILIKE ${'%' + params.data.city + '%'}`);
  }
  if (params.data.serviceType) {
    conditions.push(sql`${providersTable.servicesOffered} ILIKE ${'%' + params.data.serviceType + '%'}`);
  }
  if (params.data.verificationStatus) {
    conditions.push(eq(providersTable.verificationStatus, params.data.verificationStatus));
  }
  if (params.data.hasLocation === "true") {
    conditions.push(sql`${providersTable.latitude} IS NOT NULL`);
  }

  const providers = await db
    .select()
    .from(providersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${providersTable.createdAt} DESC`);

  res.json(
    providers.map((p) => ({
      ...p,
      sourceCount: parseInt(p.sourceCount, 10) || 0,
    })),
  );
});

router.post("/providers", async (req, res): Promise<void> => {
  const body = CreateProviderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { evidenceFileId, ...providerData } = body.data;

  const [provider] = await db
    .insert(providersTable)
    .values({ ...providerData, sourceCount: evidenceFileId ? "1" : "0" })
    .returning();

  if (evidenceFileId) {
    await db
      .update(evidenceFilesTable)
      .set({ providerId: provider.id })
      .where(eq(evidenceFilesTable.id, evidenceFileId));
  }

  res.status(201).json({ ...provider, sourceCount: parseInt(provider.sourceCount, 10) || 0 });
});

router.get("/providers/:id", async (req, res): Promise<void> => {
  const params = GetProviderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [provider] = await db
    .select()
    .from(providersTable)
    .where(eq(providersTable.id, params.data.id));

  if (!provider) {
    res.status(404).json({ error: "Provider not found" });
    return;
  }

  const [evidenceFiles, extractedFields, reviewItems] = await Promise.all([
    db.select().from(evidenceFilesTable).where(eq(evidenceFilesTable.providerId, params.data.id)),
    db.select().from(extractedFieldsTable).where(eq(extractedFieldsTable.providerId, params.data.id)),
    db.select().from(reviewItemsTable).where(sql`${reviewItemsTable.providerId} = ${params.data.id}`),
  ]);

  res.json({
    ...provider,
    sourceCount: parseInt(provider.sourceCount, 10) || 0,
    evidenceFiles: evidenceFiles.map((f) => ({ ...f, uploadDate: f.createdAt })),
    extractedFields,
    reviewItems,
  });
});

router.patch("/providers/:id", async (req, res): Promise<void> => {
  const params = UpdateProviderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateProviderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body.data)) {
    if (v !== undefined) updates[k] = v;
  }

  if (Object.keys(updates).length === 0) {
    const [existing] = await db.select().from(providersTable).where(eq(providersTable.id, params.data.id));
    if (!existing) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    res.json({ ...existing, sourceCount: parseInt(existing.sourceCount, 10) || 0 });
    return;
  }

  const [provider] = await db
    .update(providersTable)
    .set(updates)
    .where(eq(providersTable.id, params.data.id))
    .returning();

  if (!provider) {
    res.status(404).json({ error: "Provider not found" });
    return;
  }

  res.json({ ...provider, sourceCount: parseInt(provider.sourceCount, 10) || 0 });
});

export default router;
