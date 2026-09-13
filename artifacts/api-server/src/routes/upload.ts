import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
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

const MAX_EXTRACTED_TEXT = 180_000;
const LLAMAPARSE_BASE_URL = "https://api.cloud.llamaindex.ai";

type ExtractionMode = "local_text" | "local_spreadsheet" | "llamaparse" | "raw_text" | "metadata_only";

type ExtractedProvider = {
  clinicName: string;
  clinicType?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  fax?: string | null;
  servicesOffered?: string | null;
  employerAccountClues?: string | null;
  corporateBillingClues?: string | null;
  netTermsClues?: string | null;
  acceptsOutsideForms?: string | null;
  paymentRequirements?: string | null;
};

type ExtractedField = {
  fieldName: string;
  fieldValue: string;
  confidenceLevel: "high" | "medium" | "low";
  sourceSnippet: string;
};

type SourceTextResult = {
  text: string;
  mode: ExtractionMode;
  warning?: string;
};

function detectFileType(mimetype: string, originalname: string): string {
  const lower = originalname.toLowerCase();
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "pdf";
  if (
    mimetype.includes("spreadsheet") ||
    mimetype.includes("excel") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".csv")
  ) return "spreadsheet";
  if (
    mimetype.includes("word") ||
    lower.endsWith(".doc") ||
    lower.endsWith(".docx")
  ) return "document";
  if (mimetype === "text/plain" || mimetype === "text/csv" || lower.endsWith(".txt")) return "text";
  return "other";
}

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, MAX_EXTRACTED_TEXT);
}

function safeFilenameLabel(filename: string) {
  const base = path.basename(filename, path.extname(filename)).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return base || "Unidentified Provider";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseWithLlamaParse(file: Express.Multer.File): Promise<SourceTextResult> {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY?.trim();
  if (!apiKey) {
    return {
      text: "",
      mode: "metadata_only",
      warning: "LLAMA_CLOUD_API_KEY is not configured; the file was saved without inventing document contents.",
    };
  }

  try {
    const fileBuffer = await fs.promises.readFile(file.path);
    const form = new FormData();
    form.append("file", new Blob([fileBuffer], { type: file.mimetype || "application/octet-stream" }), file.originalname);
    form.append(
      "configuration",
      JSON.stringify({
        tier: process.env.LLAMAPARSE_TIER?.trim() || "cost_effective",
        version: "latest",
      }),
    );

    const uploadResponse = await fetch(`${LLAMAPARSE_BASE_URL}/api/v2/parse/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!uploadResponse.ok) {
      const body = await uploadResponse.text();
      throw new Error(`LlamaParse upload failed (${uploadResponse.status}): ${body.slice(0, 500)}`);
    }

    const uploadJson = await uploadResponse.json() as { id?: string; status?: string; error_message?: string | null; text_full?: string };
    const jobId = uploadJson.id;
    if (!jobId) throw new Error("LlamaParse did not return a job id.");

    if (uploadJson.status === "COMPLETED" && uploadJson.text_full) {
      return { text: cleanText(uploadJson.text_full), mode: "llamaparse" };
    }

    const deadline = Date.now() + 75_000;
    while (Date.now() < deadline) {
      await sleep(900);
      const statusResponse = await fetch(`${LLAMAPARSE_BASE_URL}/api/v2/parse/${encodeURIComponent(jobId)}?expand=text_full`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!statusResponse.ok) {
        const body = await statusResponse.text();
        throw new Error(`LlamaParse status failed (${statusResponse.status}): ${body.slice(0, 500)}`);
      }

      const statusJson = await statusResponse.json() as {
        id?: string;
        status?: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
        error_message?: string | null;
        text_full?: string;
      };

      if (statusJson.status === "COMPLETED") {
        return { text: cleanText(statusJson.text_full || ""), mode: "llamaparse" };
      }
      if (statusJson.status === "FAILED" || statusJson.status === "CANCELLED") {
        throw new Error(statusJson.error_message || `LlamaParse job ${statusJson.status.toLowerCase()}.`);
      }
    }

    throw new Error("LlamaParse timed out before the parse completed.");
  } catch (error) {
    logger.warn({ err: error, filename: file.originalname }, "LlamaParse unavailable; preserving upload without fabricated extraction");
    return {
      text: "",
      mode: "metadata_only",
      warning: error instanceof Error ? error.message : "Document parser unavailable.",
    };
  }
}

async function extractSourceText(file: Express.Multer.File, fileType: string): Promise<SourceTextResult> {
  if (fileType === "text") {
    const text = await fs.promises.readFile(file.path, "utf8");
    return { text: cleanText(text), mode: "local_text" };
  }

  if (fileType === "spreadsheet") {
    const workbook = XLSX.readFile(file.path, { cellDates: false, cellFormula: false });
    const chunks = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
      return `# Sheet: ${sheetName}\n${csv}`;
    });
    return { text: cleanText(chunks.join("\n\n")), mode: "local_spreadsheet" };
  }

  return parseWithLlamaParse(file);
}

function firstLabelValue(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*[:\\-]\\s*([^\\n]{2,160})`, "i"));
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function lineContaining(text: string, pattern: RegExp): string | null {
  const lines = text.split("\n");
  const line = lines.find((candidate) => pattern.test(candidate));
  return line?.trim().slice(0, 300) || null;
}

function findPhone(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp(`${escaped}\\s*[:\\-]?\\s*(\\+?[0-9][0-9(). \\-]{7,22}[0-9])`, "i"));
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function detectClinicType(text: string): string | null {
  const lower = text.toLowerCase();
  if (/occupational (health|medicine)|employee health/.test(lower)) return "Occupational Medicine Clinic";
  if (/dental|dentistry|oral surgery/.test(lower)) return "Dental Clinic";
  if (/laboratory|diagnostic lab|pathology/.test(lower)) return "Laboratory / Diagnostic Center";
  if (/cardiology|heart center/.test(lower)) return "Cardiology Practice";
  if (/urgent care/.test(lower)) return "Urgent Care Clinic";
  if (/hospital|medical center/.test(lower)) return "Hospital / Medical Center";
  return null;
}

function detectServices(text: string): string[] {
  const servicePatterns: Array<[string, RegExp]> = [
    ["Physical Exams", /\b(?:physical exam(?:ination)?s?|pre[- ]?employment physicals?|medical examinations?)\b/i],
    ["Audiometry", /\b(?:audiometry|audiogram|hearing test(?:ing)?)\b/i],
    ["Pulmonary Function Testing", /\b(?:pulmonary function|spirometr(?:y|ic)|pft)\b/i],
    ["EKG / ECG", /\b(?:ekg|ecg|electrocardiogram)\b/i],
    ["Treadmill Stress Testing", /\b(?:treadmill stress|exercise stress|stress test)\b/i],
    ["Chest X-Ray", /\b(?:chest x[- ]?ray|cxr)\b/i],
    ["X-Ray", /\bx[- ]?ray\b/i],
    ["Laboratory Testing", /\b(?:laboratory testing|blood work|blood test|cbc|urinalysis|chemistry panel)\b/i],
    ["Drug Testing", /\b(?:drug screen|drug testing|toxicology screen)\b/i],
    ["Vision Testing", /\b(?:vision testing|visual acuity|color vision)\b/i],
    ["Dental Evaluation", /\b(?:dental evaluation|dental exam|panoramic x[- ]?ray|bitewings?)\b/i],
    ["Vaccinations", /\b(?:vaccination|vaccine|immunization)\b/i],
    ["Travel Medicine", /\btravel medicine\b/i],
    ["Yellow Fever Vaccine", /\byellow fever\b/i],
    ["Respirator Fit Testing", /\b(?:respirator fit|fit testing)\b/i],
    ["DOT Physicals", /\b(?:dot physical|department of transportation physical)\b/i],
  ];

  const services: string[] = [];
  for (const [name, pattern] of servicePatterns) {
    if (pattern.test(text)) services.push(name);
  }
  return services;
}

function extractProviderData(
  text: string,
  filename: string,
  metadata: { providerName?: string; city?: string; state?: string },
): { extracted: ExtractedProvider; fields: ExtractedField[] } {
  const normalized = cleanText(text);
  const fields: ExtractedField[] = [];
  const addField = (
    fieldName: keyof ExtractedProvider,
    fieldValue: string | null | undefined,
    confidenceLevel: ExtractedField["confidenceLevel"],
    sourceSnippet: string,
  ) => {
    const value = String(fieldValue ?? "").trim();
    if (!value) return;
    fields.push({ fieldName, fieldValue: value, confidenceLevel, sourceSnippet: sourceSnippet.slice(0, 500) });
  };

  const labelledClinicName = firstLabelValue(normalized, ["Clinic Name", "Provider Name", "Facility Name", "Organization"]);
  const clinicName = metadata.providerName?.trim() || labelledClinicName || `Unidentified Provider (${safeFilenameLabel(filename)})`;
  const clinicType = detectClinicType(normalized);

  const labelledAddress = firstLabelValue(normalized, ["Address", "Street Address", "Location"]);
  const addressMatch = normalized.match(/\b\d{1,6}\s+[A-Za-z0-9 .,'#\/-]{3,80}\s(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Court|Ct\.?|Highway|Hwy\.?|Parkway|Pkwy\.?)[^\n]{0,80}/i);
  const address = labelledAddress || addressMatch?.[0]?.trim() || null;

  const cityStateZip = normalized.match(/\b([A-Za-z .'-]{2,60}),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  const city = metadata.city?.trim() || firstLabelValue(normalized, ["City"]) || cityStateZip?.[1]?.trim() || null;
  const state = metadata.state?.trim() || firstLabelValue(normalized, ["State"]) || cityStateZip?.[2]?.trim() || null;
  const zip = firstLabelValue(normalized, ["ZIP", "Zip Code", "Postal Code"]) || cityStateZip?.[3]?.trim() || null;

  const phone = findPhone(normalized, ["Phone", "Telephone", "Tel"]);
  const fax = findPhone(normalized, ["Fax"]);
  const services = detectServices(normalized);

  const employerAccountClues = lineContaining(normalized, /employer account|company account|occupational health account|employer billing/i);
  const corporateBillingClues = lineContaining(normalized, /corporate billing|direct billing|bill(?:ing)? to company|invoice(?:d|s|ing)? employer/i);
  const netTermsClues = lineContaining(normalized, /\bnet\s*[- ]?\d{1,3}\b|payment terms|terms of payment/i);
  const paymentRequirements = lineContaining(normalized, /payment (?:is )?due|pay(?:ment)? at time of service|prepay|pre-payment|invoice|billing terms|credit card/i);
  const outsideFormsLine = lineContaining(normalized, /outside forms|employer forms|company forms|client forms|bring (?:your|employer) forms/i);
  const acceptsOutsideForms = outsideFormsLine ? "Evidence suggests outside/employer forms are accepted" : null;

  if (metadata.providerName?.trim()) addField("clinicName", clinicName, "high", "[Intake metadata] Provider name supplied at upload.");
  else if (labelledClinicName) addField("clinicName", clinicName, "high", lineContaining(normalized, /clinic name|provider name|facility name|organization/i) || labelledClinicName);
  else addField("clinicName", clinicName, "low", `[System placeholder] No provider name was found in ${filename}.`);

  if (clinicType) addField("clinicType", clinicType, "medium", lineContaining(normalized, /occupational|dental|laboratory|cardiology|urgent care|hospital|medical center/i) || clinicType);
  if (address) addField("address", address, labelledAddress ? "high" : "medium", labelledAddress || address);
  if (metadata.city?.trim()) addField("city", city, "high", "[Intake metadata] City supplied at upload.");
  else if (city) addField("city", city, "medium", cityStateZip?.[0] || city);
  if (metadata.state?.trim()) addField("state", state, "high", "[Intake metadata] State supplied at upload.");
  else if (state) addField("state", state, "medium", cityStateZip?.[0] || state);
  if (zip) addField("zip", zip, "medium", cityStateZip?.[0] || zip);
  if (phone) addField("phone", phone, "high", lineContaining(normalized, /phone|telephone|tel\b/i) || phone);
  if (fax) addField("fax", fax, "high", lineContaining(normalized, /fax/i) || fax);
  if (services.length) addField("servicesOffered", services.join(", "), "medium", `Detected service terms in document: ${services.join(", ")}`);
  if (employerAccountClues) addField("employerAccountClues", employerAccountClues, "medium", employerAccountClues);
  if (corporateBillingClues) addField("corporateBillingClues", corporateBillingClues, "medium", corporateBillingClues);
  if (netTermsClues) addField("netTermsClues", netTermsClues, "high", netTermsClues);
  if (paymentRequirements) addField("paymentRequirements", paymentRequirements, "medium", paymentRequirements);
  if (acceptsOutsideForms && outsideFormsLine) addField("acceptsOutsideForms", acceptsOutsideForms, "medium", outsideFormsLine);

  return {
    extracted: {
      clinicName,
      clinicType,
      address,
      city,
      state,
      zip,
      phone,
      fax,
      servicesOffered: services.length ? services.join(", ") : null,
      employerAccountClues,
      corporateBillingClues,
      netTermsClues,
      acceptsOutsideForms,
      paymentRequirements,
    },
    fields,
  };
}

async function saveExtraction(args: {
  evidenceFile: typeof evidenceFilesTable.$inferSelect;
  extracted: ExtractedProvider;
  fields: ExtractedField[];
  extractedText: string;
  extractionMode: ExtractionMode;
  parseWarning?: string;
  issueType: string;
  description: string;
}) {
  const {
    evidenceFile,
    extracted,
    fields,
    extractedText,
    extractionMode,
    parseWarning,
    issueType,
    description,
  } = args;

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
    .set({
      providerId: provider.id,
      processingStatus: extractedText ? "Extracted" : "Needs Parser",
      extractedText: extractedText || null,
    })
    .where(eq(evidenceFilesTable.id, evidenceFile.id));

  const insertedFields = fields.length
    ? await db
        .insert(extractedFieldsTable)
        .values(fields.map((field) => ({ ...field, evidenceFileId: evidenceFile.id, providerId: provider.id })))
        .returning()
    : [];

  const [reviewItem] = await db
    .insert(reviewItemsTable)
    .values({
      reviewStatus: "pending",
      priority: extractedText ? "normal" : "high",
      issueType,
      description: parseWarning ? `${description}. Parser note: ${parseWarning}` : description,
      providerId: provider.id,
      evidenceFileId: evidenceFile.id,
      providerName: extracted.clinicName,
    })
    .returning();

  return { provider, insertedFields, reviewItem, extractionMode, parseWarning };
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

    const { state, city, providerName, sourceType, category, sourceUrl, notes } = req.body as Record<string, string | undefined>;
    const fileType = detectFileType(req.file.mimetype, req.file.originalname);
    const folderPath = [state ?? "Unknown State", city ?? "Unknown City", providerName ?? "Unknown Provider", fileType]
      .map((value) => value.replace(/[^a-zA-Z0-9 _-]/g, ""))
      .join("/");

    try {
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

      const source = await extractSourceText(req.file, fileType);
      const { extracted, fields } = extractProviderData(source.text, req.file.originalname, { providerName, city, state });
      const saved = await saveExtraction({
        evidenceFile,
        extracted,
        fields,
        extractedText: source.text,
        extractionMode: source.mode,
        parseWarning: source.warning,
        issueType: source.text ? "New Extraction" : "Extraction Needs Parser",
        description: source.text
          ? `Verify extracted data from ${req.file.originalname}`
          : `Review upload metadata for ${req.file.originalname}; document text was not available`,
      });

      logger.info(
        { evidenceFileId: evidenceFile.id, providerId: saved.provider.id, extractionMode: source.mode },
        "File uploaded and processed without simulated extraction",
      );

      res.status(201).json({
        evidenceFile: {
          ...evidenceFile,
          processingStatus: source.text ? "Extracted" : "Needs Parser",
          providerId: saved.provider.id,
          uploadDate: evidenceFile.createdAt,
        },
        extractedProvider: { ...saved.provider, sourceCount: 1 },
        reviewItem: saved.reviewItem,
        extractionSimulated: false,
        extractionMode: saved.extractionMode,
        parseWarning: saved.parseWarning ?? null,
        extractedFields: saved.insertedFields,
      });
    } catch (error) {
      logger.error({ err: error, filename: req.file.originalname }, "File intake failed");
      res.status(500).json({ error: error instanceof Error ? error.message : "File intake failed" });
    }
  },
);

router.post("/upload/paste", async (req, res): Promise<void> => {
  const body = UploadPastedTextBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { text, state, city, providerName, sourceType, category, sourceUrl, notes } = body.data;
  const filename = `pasted-note-${Date.now()}.txt`;
  const folderPath = [state ?? "Unknown State", city ?? "Unknown City", providerName ?? "Unknown Provider", "notes"]
    .map((value) => value.replace(/[^a-zA-Z0-9 _-]/g, ""))
    .join("/");

  try {
    const normalizedText = cleanText(text);
    const [evidenceFile] = await db
      .insert(evidenceFilesTable)
      .values({
        originalFilename: filename,
        fileType: "text",
        mimeType: "text/plain",
        extractedText: normalizedText,
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

    const { extracted, fields } = extractProviderData(normalizedText, filename, { providerName, city, state });
    const saved = await saveExtraction({
      evidenceFile,
      extracted,
      fields,
      extractedText: normalizedText,
      extractionMode: "raw_text",
      issueType: "Pasted Note",
      description: "Verify extracted data from pasted text",
    });

    res.status(201).json({
      evidenceFile: {
        ...evidenceFile,
        processingStatus: "Extracted",
        providerId: saved.provider.id,
        uploadDate: evidenceFile.createdAt,
      },
      extractedProvider: { ...saved.provider, sourceCount: 1 },
      reviewItem: saved.reviewItem,
      extractionSimulated: false,
      extractionMode: saved.extractionMode,
      parseWarning: null,
      extractedFields: saved.insertedFields,
    });
  } catch (error) {
    logger.error({ err: error }, "Pasted text intake failed");
    res.status(500).json({ error: error instanceof Error ? error.message : "Pasted text intake failed" });
  }
});

export default router;
