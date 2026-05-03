import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  evidenceFilesTable,
  providersTable,
  reviewItemsTable,
} from "@workspace/db";
import { count, sql } from "drizzle-orm";
import {
  GetDashboardStatsResponse,
  GetRecentUploadsResponse,
  GetDashboardActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [[evidenceCount], [providerCount], [reviewCount], [mappedCount]] =
    await Promise.all([
      db.select({ count: count() }).from(evidenceFilesTable),
      db.select({ count: count() }).from(providersTable),
      db
        .select({ count: count() })
        .from(reviewItemsTable)
        .where(sql`${reviewItemsTable.reviewStatus} IN ('pending','in_progress')`),
      db
        .select({ count: count() })
        .from(providersTable)
        .where(sql`${providersTable.latitude} IS NOT NULL`),
    ]);

  const highValueResult = await db
    .select({ count: count() })
    .from(providersTable)
    .where(
      sql`${providersTable.employerAccountClues} IS NOT NULL OR ${providersTable.corporateBillingClues} IS NOT NULL`,
    );

  const statesResult = await db
    .selectDistinct({ state: providersTable.state })
    .from(providersTable)
    .where(sql`${providersTable.state} IS NOT NULL`);

  const servicesResult = await db
    .select({ services: providersTable.servicesOffered })
    .from(providersTable)
    .where(sql`${providersTable.servicesOffered} IS NOT NULL`);

  const processingResult = await db
    .select({ count: count() })
    .from(evidenceFilesTable)
    .where(sql`${evidenceFilesTable.processingStatus} IN ('Uploaded', 'Processing')`);

  const recentResult = await db
    .select({ count: count() })
    .from(evidenceFilesTable)
    .where(sql`${evidenceFilesTable.createdAt} > NOW() - INTERVAL '7 days'`);

  const stats = {
    totalEvidenceFiles: evidenceCount.count,
    totalProviders: providerCount.count,
    providersMapped: mappedCount.count,
    providersNeedingReview: reviewCount.count,
    highValueLeads: highValueResult[0]?.count ?? 0,
    statesCovered: statesResult.length,
    servicesCovered: servicesResult.length,
    processingQueue: processingResult[0]?.count ?? 0,
    recentUploadsCount: recentResult[0]?.count ?? 0,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/dashboard/recent-uploads", async (req, res): Promise<void> => {
  const files = await db
    .select()
    .from(evidenceFilesTable)
    .orderBy(sql`${evidenceFilesTable.createdAt} DESC`)
    .limit(10);

  res.json(GetRecentUploadsResponse.parse(files.map((f) => ({
    ...f,
    uploadDate: f.createdAt,
  }))));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const [files, providers, reviews] = await Promise.all([
    db
      .select()
      .from(evidenceFilesTable)
      .orderBy(sql`${evidenceFilesTable.createdAt} DESC`)
      .limit(5),
    db
      .select()
      .from(providersTable)
      .orderBy(sql`${providersTable.createdAt} DESC`)
      .limit(5),
    db
      .select()
      .from(reviewItemsTable)
      .orderBy(sql`${reviewItemsTable.createdAt} DESC`)
      .limit(5),
  ]);

  const activities = [
    ...files.map((f) => ({
      id: f.id * 100,
      type: "upload",
      description: `File uploaded: ${f.originalFilename}`,
      entityName: f.originalFilename,
      createdAt: f.createdAt,
    })),
    ...providers.map((p) => ({
      id: p.id * 100 + 1,
      type: "provider",
      description: `Provider added: ${p.clinicName}`,
      entityName: p.clinicName,
      createdAt: p.createdAt,
    })),
    ...reviews.map((r) => ({
      id: r.id * 100 + 2,
      type: "review",
      description: `Review item: ${r.description}`,
      entityName: r.providerName ?? null,
      createdAt: r.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15);

  res.json(GetDashboardActivityResponse.parse(activities));
});

export default router;
