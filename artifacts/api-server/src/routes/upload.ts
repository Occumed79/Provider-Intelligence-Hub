import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  evidenceFilesTable,
  providersTable,
  reviewItemsTable,
  extractedFieldsTable,
} from "@workspace/db";
import { UploadPastedTextBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

function detectFileType(mimetype: string, originalname: string): string {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "pdf";
  if (
    mimetype.includes("spreadsheet") ||
    mimetype.includes("excel") ||
    originalname.endsWith(".xlsx") ||
    originalname.endsWith(".xls") ||
    originalname.endsWith(".csv")
  )
    return "spreadsheet";
  if (
    mimetype.includes("word") ||
    originalname.endsWith(".doc") ||
    originalname.endsWith(".docx")
  )
    return "document";
  if (mimetype === "text/plain" || mimetype === "text/csv") return "text";
  return "other";
}

function simulateExtraction(
  filename: string,
  fileType: string,
  providerName?: string,
  city?: string,
  state?: string,
) {
  const mockServices = [
    "Occupational Health",
    "Drug Testing",
    "Physical Exams",
    "X-Ray",
    "DOT Physicals",
    "Urgent Care",
    "Pulmonary Function Testing",
    "Audiometry",
    "Vision Testing",
    "Chest X-Ray",
    "Stress Testing",
    "Yellow Fever Vaccine",
    "Travel Medicine",
  ];

  const pickedServices = mockServices
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 4) + 2)
    .join(", ");

  const areaCode = Math.floor(Math.random() * 900) + 100;
  const phone = `(${areaCode}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;

  const extracted = {
    clinicName: providerName ?? `${city ?? "Regional"} Occupational Health Clinic`,
    clinicType: "Occupational Medicine Clinic",
    address: `${Math.floor(Math.random() * 9000) + 1000} Medical Center Dr`,
    city: city ?? "Unknown",
    state: state ?? "Unknown",
    zip: `${Math.floor(Math.random() * 90000) + 10000}`,
    phone,
    fax: `(${areaCode}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    servicesOffered: pickedServices,
    employerAccountClues: Math.random() > 0.5 ? "Mentions employer billing accounts available" : null,
    corporateBillingClues: Math.random() > 0.6 ? "Corporate billing accepted" : null,
    netTermsClues: Math.random() > 0.7 ? "NET 30 terms available" : null,
    acceptsOutsideForms: Math.random() > 0.4 ? "Yes - accepts outside employer forms" : null,
    tpaFriendlyClues: Math.random() > 0.5 ? "Works with TPAs" : null,
    paymentRequirements: Math.random() > 0.5 ? "Payment at time of service required" : "Billing available",
  };

  const fields = Object.entries(extracted)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => ({
      fieldName: k,
      fieldValue: String(v),
      confidenceLevel: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
      sourceSnippet: `[SIMULATED] Extracted from ${filename} (${fileType} file)`,
    }));

  return { extracted, fields };
}

const router: IRouter = Router();

router.post(
  "/upload",
  upload.single("file"),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const {
      state,
      city,
      providerName,
      sourceType,
      category,
      sourceUrl,
      notes,
    } = req.body as Record<string, string | undefined>;

    const fileType = detectFileType(req.file.mimetype, req.file.originalname);

    const folderPath = [
      state ?? "Unknown State",
      city ?? "Unknown City",
      providerName ?? "Unknown Provider",
      fileType,
    ]
      .map((s) => s.replace(/[^a-zA-Z0-9 _-]/g, ""))
      .join("/");

    const [evidenceFile] = await db
      .insert(evidenceFilesTable)
      .values({
        originalFilename: req.file.originalname,
        fileType,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        storagePath: req.file.path,
        associatedProvider: providerName ?? null,
        associatedCity: city ?? null,
        associatedState: state ?? null,
        sourceType: sourceType ?? null,
        category: category ?? null,
        sourceUrl: sourceUrl ?? null,
        notes: notes ?? null,
        folderPath,
        processingStatus: "Processing",
      })
      .returning();

    const { extracted, fields } = simulateExtraction(
      req.file.originalname,
      fileType,
      providerName,
      city,
      state,
    );

    const [provider] = await db
      .insert(providersTable)
      .values({
        ...extracted,
        verificationStatus: "Needs Review",
        sourceCount: "1",
      })
      .returning();

    await db
      .update(evidenceFilesTable)
      .set({ providerId: provider.id, processingStatus: "Extracted" })
      .where(eq(evidenceFilesTable.id, evidenceFile.id));

    const insertedFields = await db
      .insert(extractedFieldsTable)
      .values(
        fields.map((f) => ({
          ...f,
          evidenceFileId: evidenceFile.id,
          providerId: provider.id,
        })),
      )
      .returning();

    const [reviewItem] = await db
      .insert(reviewItemsTable)
      .values({
        reviewStatus: "pending",
        priority: "normal",
        issueType: "New Extraction",
        description: `Verify extracted data from ${req.file.originalname}`,
        providerId: provider.id,
        evidenceFileId: evidenceFile.id,
        providerName: extracted.clinicName,
      })
      .returning();

    logger.info({ evidenceFileId: evidenceFile.id, providerId: provider.id }, "File uploaded and processed");

    res.status(201).json({
      evidenceFile: {
        ...evidenceFile,
        processingStatus: "Extracted",
        providerId: provider.id,
        uploadDate: evidenceFile.createdAt,
      },
      extractedProvider: { ...provider, sourceCount: 1 },
      reviewItem,
      extractionSimulated: true,
      extractedFields: insertedFields,
    });
  },
);

router.post("/upload/paste", async (req, res): Promise<void> => {
  const body = UploadPastedTextBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const {
    text,
    state,
    city,
    providerName,
    sourceType,
    category,
    sourceUrl,
    notes,
  } = body.data;

  const filename = `pasted-note-${Date.now()}.txt`;
  const folderPath = [
    state ?? "Unknown State",
    city ?? "Unknown City",
    providerName ?? "Unknown Provider",
    "notes",
  ]
    .map((s) => s.replace(/[^a-zA-Z0-9 _-]/g, ""))
    .join("/");

  const [evidenceFile] = await db
    .insert(evidenceFilesTable)
    .values({
      originalFilename: filename,
      fileType: "text",
      mimeType: "text/plain",
      extractedText: text,
      associatedProvider: providerName ?? null,
      associatedCity: city ?? null,
      associatedState: state ?? null,
      sourceType: sourceType ?? null,
      category: category ?? null,
      sourceUrl: sourceUrl ?? null,
      notes: notes ?? null,
      folderPath,
      processingStatus: "Processing",
    })
    .returning();

  const { extracted, fields } = simulateExtraction(
    filename,
    "text",
    providerName,
    city,
    state,
  );

  const [provider] = await db
    .insert(providersTable)
    .values({
      ...extracted,
      verificationStatus: "Needs Review",
      sourceCount: "1",
    })
    .returning();

  await db
    .update(evidenceFilesTable)
    .set({ providerId: provider.id, processingStatus: "Extracted" })
    .where(eq(evidenceFilesTable.id, evidenceFile.id));

  const insertedFields = await db
    .insert(extractedFieldsTable)
    .values(
      fields.map((f) => ({
        ...f,
        evidenceFileId: evidenceFile.id,
        providerId: provider.id,
      })),
    )
    .returning();

  const [reviewItem] = await db
    .insert(reviewItemsTable)
    .values({
      reviewStatus: "pending",
      priority: "normal",
      issueType: "Pasted Note",
      description: `Verify extracted data from pasted text`,
      providerId: provider.id,
      evidenceFileId: evidenceFile.id,
      providerName: extracted.clinicName,
    })
    .returning();

  res.status(201).json({
    evidenceFile: {
      ...evidenceFile,
      processingStatus: "Extracted",
      providerId: provider.id,
      uploadDate: evidenceFile.createdAt,
    },
    extractedProvider: { ...provider, sourceCount: 1 },
    reviewItem,
    extractionSimulated: true,
    extractedFields: insertedFields,
  });
});

export default router;
