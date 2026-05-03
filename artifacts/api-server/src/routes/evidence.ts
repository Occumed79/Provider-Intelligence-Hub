import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { evidenceFilesTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import {
  GetEvidenceFileParams,
  UpdateEvidenceFileParams,
  UpdateEvidenceFileBody,
  DeleteEvidenceFileParams,
  CreateEvidenceFileBody,
  ListEvidenceFilesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/evidence/folder-tree", async (req, res): Promise<void> => {
  const files = await db.select().from(evidenceFilesTable);

  const tree: Record<string, Record<string, Record<string, { count: number }>>> = {};

  for (const f of files) {
    const state = f.associatedState ?? "Unknown State";
    const city = f.associatedCity ?? "Unknown City";
    const provider = f.associatedProvider ?? "Unknown Provider";

    if (!tree[state]) tree[state] = {};
    if (!tree[state][city]) tree[state][city] = {};
    if (!tree[state][city][provider]) tree[state][city][provider] = { count: 0 };
    tree[state][city][provider].count++;
  }

  const result = Object.entries(tree).map(([state, cities]) => ({
    name: state,
    path: `/${state}`,
    type: "state",
    fileCount: Object.values(cities).flatMap((c) => Object.values(c)).reduce((a, b) => a + b.count, 0),
    children: Object.entries(cities).map(([city, providers]) => ({
      name: city,
      path: `/${state}/${city}`,
      type: "city",
      fileCount: Object.values(providers).reduce((a, b) => a + b.count, 0),
      children: Object.entries(providers).map(([provider, data]) => ({
        name: provider,
        path: `/${state}/${city}/${provider}`,
        type: "provider",
        fileCount: data.count,
        children: [],
      })),
    })),
  }));

  res.json(result);
});

router.get("/evidence", async (req, res): Promise<void> => {
  const params = ListEvidenceFilesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.state) {
    conditions.push(sql`${evidenceFilesTable.associatedState} ILIKE ${params.data.state}`);
  }
  if (params.data.city) {
    conditions.push(sql`${evidenceFilesTable.associatedCity} ILIKE ${params.data.city}`);
  }
  if (params.data.providerName) {
    conditions.push(sql`${evidenceFilesTable.associatedProvider} ILIKE ${'%' + params.data.providerName + '%'}`);
  }
  if (params.data.sourceType) {
    conditions.push(eq(evidenceFilesTable.sourceType, params.data.sourceType));
  }
  if (params.data.status) {
    conditions.push(eq(evidenceFilesTable.processingStatus, params.data.status));
  }

  const files = await db
    .select()
    .from(evidenceFilesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${evidenceFilesTable.createdAt} DESC`);

  res.json(files.map((f) => ({ ...f, uploadDate: f.createdAt })));
});

router.post("/evidence", async (req, res): Promise<void> => {
  const body = CreateEvidenceFileBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [file] = await db
    .insert(evidenceFilesTable)
    .values(body.data)
    .returning();

  res.status(201).json({ ...file, uploadDate: file.createdAt });
});

router.get("/evidence/:id", async (req, res): Promise<void> => {
  const params = GetEvidenceFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [file] = await db
    .select()
    .from(evidenceFilesTable)
    .where(eq(evidenceFilesTable.id, params.data.id));

  if (!file) {
    res.status(404).json({ error: "Evidence file not found" });
    return;
  }

  res.json({ ...file, uploadDate: file.createdAt });
});

router.patch("/evidence/:id", async (req, res): Promise<void> => {
  const params = UpdateEvidenceFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateEvidenceFileBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (body.data.associatedProvider !== undefined) updates.associatedProvider = body.data.associatedProvider;
  if (body.data.associatedCity !== undefined) updates.associatedCity = body.data.associatedCity;
  if (body.data.associatedState !== undefined) updates.associatedState = body.data.associatedState;
  if (body.data.sourceType !== undefined) updates.sourceType = body.data.sourceType;
  if (body.data.category !== undefined) updates.category = body.data.category;
  if (body.data.notes !== undefined) updates.notes = body.data.notes;
  if (body.data.processingStatus !== undefined) updates.processingStatus = body.data.processingStatus;
  if (body.data.providerId !== undefined) updates.providerId = body.data.providerId;

  if (Object.keys(updates).length === 0) {
    const [existing] = await db
      .select()
      .from(evidenceFilesTable)
      .where(eq(evidenceFilesTable.id, params.data.id));
    if (!existing) {
      res.status(404).json({ error: "Evidence file not found" });
      return;
    }
    res.json({ ...existing, uploadDate: existing.createdAt });
    return;
  }

  const [file] = await db
    .update(evidenceFilesTable)
    .set(updates)
    .where(eq(evidenceFilesTable.id, params.data.id))
    .returning();

  if (!file) {
    res.status(404).json({ error: "Evidence file not found" });
    return;
  }

  res.json({ ...file, uploadDate: file.createdAt });
});

router.delete("/evidence/:id", async (req, res): Promise<void> => {
  const params = DeleteEvidenceFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [file] = await db
    .delete(evidenceFilesTable)
    .where(eq(evidenceFilesTable.id, params.data.id))
    .returning();

  if (!file) {
    res.status(404).json({ error: "Evidence file not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
