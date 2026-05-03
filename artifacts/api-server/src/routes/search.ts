import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { evidenceFilesTable, providersTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { SearchQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const params = SearchQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const q = params.data.q.trim();
  const like = `%${q}%`;

  const [providers, evidenceFiles] = await Promise.all([
    db
      .select()
      .from(providersTable)
      .where(
        sql`
          ${providersTable.clinicName} ILIKE ${like} OR
          ${providersTable.city} ILIKE ${like} OR
          ${providersTable.state} ILIKE ${like} OR
          ${providersTable.servicesOffered} ILIKE ${like} OR
          ${providersTable.address} ILIKE ${like} OR
          ${providersTable.notes} ILIKE ${like} OR
          ${providersTable.employerAccountClues} ILIKE ${like} OR
          ${providersTable.corporateBillingClues} ILIKE ${like} OR
          ${providersTable.netTermsClues} ILIKE ${like} OR
          ${providersTable.acceptsOutsideForms} ILIKE ${like} OR
          ${providersTable.tpaFriendlyClues} ILIKE ${like} OR
          ${providersTable.paymentRequirements} ILIKE ${like}
        `,
      )
      .limit(20),
    db
      .select()
      .from(evidenceFilesTable)
      .where(
        sql`
          ${evidenceFilesTable.originalFilename} ILIKE ${like} OR
          ${evidenceFilesTable.extractedText} ILIKE ${like} OR
          ${evidenceFilesTable.associatedProvider} ILIKE ${like} OR
          ${evidenceFilesTable.associatedCity} ILIKE ${like} OR
          ${evidenceFilesTable.associatedState} ILIKE ${like} OR
          ${evidenceFilesTable.notes} ILIKE ${like} OR
          ${evidenceFilesTable.sourceType} ILIKE ${like}
        `,
      )
      .limit(20),
  ]);

  res.json({
    providers: providers.map((p) => ({
      ...p,
      sourceCount: parseInt(p.sourceCount, 10) || 0,
    })),
    evidenceFiles: evidenceFiles.map((f) => ({ ...f, uploadDate: f.createdAt })),
    totalResults: providers.length + evidenceFiles.length,
    query: q,
  });
});

export default router;
