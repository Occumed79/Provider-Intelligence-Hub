import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";
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
const MAX_OCR_PDF_PAGES = 10;
const MIN_USABLE_PDF_TEXT = 90;

type ExtractionMode =
  | "local_text"
  | "local_spreadsheet"
  | "local_docx"
  | "local_pdf"
  | "local_pdf_ocr"
  | "local_image_ocr"
  | "raw_text"
  | "metadata_only";

type ExtractedProvider = {
  clinicName: string;
  clinicType?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  fax?: string | null;
  website?: string | null;
  email?: string | null;
  contactPerson?: string | null;
  servicesOffered?: string | null;
  pricingNotes?: string | null;
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
  if (mimetype.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(lower)) return "image";
  if (mimetype === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (
    mimetype.includes("spreadsheet") ||
    mimetype.includes("excel") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".csv")
  ) return "spreadsheet";
  if (mimetype.includes("word") || lower.endsWith(".docx") || lower.endsWith(".doc")) return "document";
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
  const base = path
    .basename(filename, path.extname(filename))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(scan|scanned|document|upload|attachment|copy)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return base || "Unidentified Provider";
}

function sanitizeFolderPart(value: string | null | undefined, fallback: string) {
  const safe = String(value ?? "")
    .replace(/[^a-zA-Z0-9 ._()-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return safe || fallback;
}

async function ocrImages(images: Array<string | Buffer | Uint8Array>) {
  if (!images.length) return "";
  const worker = await createWorker("eng");
  try {
    const chunks: string[] = [];
    for (const image of images) {
      const { data } = await worker.recognize(image as any);
      const text = cleanText(data.text || "");
      if (text) chunks.push(text);
    }
    return cleanText(chunks.join("\n\n--- OCR PAGE ---\n\n"));
  } finally {
    await worker.terminate();
  }
}

async function parsePdfLocally(file: Express.Multer.File): Promise<SourceTextResult> {
  const buffer = await fs.promises.readFile(file.path);
  const parser = new PDFParse({ data: buffer });
  try {
    const textResult = await parser.getText({ parseHyperlinks: true });
    const extractedText = cleanText(textResult.text || "");
    if (extractedText.length >= MIN_USABLE_PDF_TEXT) {
      return { text: extractedText, mode: "local_pdf" };
    }

    const screenshots = await parser.getScreenshot({
      desiredWidth: 1600,
      first: MAX_OCR_PDF_PAGES,
    });
    const pageBuffers = screenshots.pages
      .map((page: any) => page?.data)
      .filter(Boolean)
      .map((data: any) => Buffer.isBuffer(data) ? data : Buffer.from(data));
    const ocrText = await ocrImages(pageBuffers);
    return {
      text: ocrText || extractedText,
      mode: ocrText ? "local_pdf_ocr" : "local_pdf",
      warning: !ocrText && !extractedText
        ? "The PDF contained no usable text after local text extraction and OCR."
        : undefined,
    };
  } finally {
    await parser.destroy();
  }
}

async function parseDocxLocally(file: Express.Multer.File): Promise<SourceTextResult> {
  if (!file.originalname.toLowerCase().endsWith(".docx")) {
    return {
      text: "",
      mode: "metadata_only",
      warning: "Legacy .doc files are not supported by the local parser. Use DOCX, PDF, spreadsheet, text, or image files.",
    };
  }
  const result = await mammoth.extractRawText({ path: file.path });
  return {
    text: cleanText(result.value || ""),
    mode: "local_docx",
    warning: result.messages?.length ? result.messages.map((message: any) => message.message).filter(Boolean).join("; ").slice(0, 500) : undefined,
  };
}

async function extractSourceText(file: Express.Multer.File, fileType: string): Promise<SourceTextResult> {
  try {
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

    if (fileType === "pdf") return await parsePdfLocally(file);
    if (fileType === "image") {
      const text = await ocrImages([file.path]);
      return {
        text,
        mode: "local_image_ocr",
        warning: text ? undefined : "The image OCR pass did not recover readable text.",
      };
    }
    if (fileType === "document") return await parseDocxLocally(file);

    return {
      text: "",
      mode: "metadata_only",
      warning: "This file type is not supported by the local extraction pipeline.",
    };
  } catch (error) {
    logger.warn({ err: error, filename: file.originalname, fileType }, "Local document extraction failed");
    return {
      text: "",
      mode: "metadata_only",
      warning: error instanceof Error ? error.message : "Local document extraction failed.",
    };
  }
}

function firstLabelValue(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*[:\\-]\\s*([^\\n]{2,180})`, "i"));
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

function inferClinicName(text: string, filename: string) {
  const labelled = firstLabelValue(text, ["Clinic Name", "Provider Name", "Facility Name", "Organization", "Practice Name", "Company Name"]);
  if (labelled) return { value: labelled, confidence: "high" as const, snippet: labelled };

  const providerWord = /\b(clinic|health|medical|hospital|dental|dentistry|cardiology|laborator(?:y|ies)|diagnostic|medicine|healthcare|care center|care centre|practice|polyclinic|poliklinik|medycz|medico|sanitas|hospitality health)\b/i;
  const noisy = /^(address|phone|telephone|fax|email|website|www\.|http|pricing|price list|fee schedule|agreement|contract|invoice|services|hours|page\s+\d+)/i;
  const candidate = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .slice(0, 35)
    .find((line) => line.length >= 3 && line.length <= 120 && providerWord.test(line) && !noisy.test(line));
  if (candidate) return { value: candidate, confidence: "medium" as const, snippet: candidate };

  const filenameLabel = safeFilenameLabel(filename);
  const genericFilename = /^(pricing|price list|fee schedule|agreement|contract|company profile|document|scan|image|photo|provider|clinic)$/i.test(filenameLabel);
  return {
    value: genericFilename ? `Unidentified Provider (${filenameLabel})` : filenameLabel,
    confidence: genericFilename ? "low" as const : "medium" as const,
    snippet: `[Filename] ${filename}`,
  };
}

function detectClinicType(text: string): string | null {
  const lower = text.toLowerCase();
  if (/occupational (health|medicine)|employee health/.test(lower)) return "Occupational Medicine Clinic";
  if (/dental|dentistry|oral surgery/.test(lower)) return "Dental Clinic";
  if (/laboratory|diagnostic lab|pathology/.test(lower)) return "Laboratory / Diagnostic Center";
  if (/cardiology|heart center/.test(lower)) return "Cardiology Practice";
  if (/urgent care/.test(lower)) return "Urgent Care Clinic";
  if (/hospital|medical center|medical centre/.test(lower)) return "Hospital / Medical Center";
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

function inferCategory(text: string, filename: string) {
  const sample = `${filename}\n${text.slice(0, 8_000)}`;
  if (/\b(pric(?:e|ing)|fee schedule|rate sheet|cost per|self[- ]?pay|cpt)\b/i.test(sample)) return "Pricing";
  if (/\b(provider service agreement|agreement|contract|terms and conditions|signature)\b/i.test(sample)) return "Agreement";
  if (/\b(follow[- ]?up|dear |hello |thank you|email thread|sent:|from:)\b/i.test(sample)) return "Outreach";
  return "Provider Research";
}

function extractProviderData(text: string, filename: string): { extracted: ExtractedProvider; fields: ExtractedField[] } {
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

  const clinicNameResult = inferClinicName(normalized, filename);
  const clinicName = clinicNameResult.value;
  const clinicType = detectClinicType(normalized);

  const labelledAddress = firstLabelValue(normalized, ["Address", "Street Address", "Location", "Clinic Address", "Facility Address"]);
  const addressMatch = normalized.match(/\b\d{1,6}\s+[A-Za-z0-9 .,'#\/-]{3,90}\s(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Court|Ct\.?|Highway|Hwy\.?|Parkway|Pkwy\.?)[^\n]{0,90}/i);
  const address = labelledAddress || addressMatch?.[0]?.trim() || null;

  const cityStateZip = normalized.match(/\b([A-Za-z .'-]{2,60}),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  const city = firstLabelValue(normalized, ["City", "Town", "Municipality"]) || cityStateZip?.[1]?.trim() || null;
  const state = firstLabelValue(normalized, ["State", "Province", "Region"]) || cityStateZip?.[2]?.trim() || null;
  const zip = firstLabelValue(normalized, ["ZIP", "Zip Code", "Postal Code", "Postcode"]) || cityStateZip?.[3]?.trim() || null;

  const phone = findPhone(normalized, ["Phone", "Telephone", "Tel"]);
  const fax = findPhone(normalized, ["Fax"]);
  const email = normalized.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || null;
  const website = normalized.match(/https?:\/\/[^\s)>\]}]+|\bwww\.[^\s)>\]}]+/i)?.[0] || null;
  const contactPerson = firstLabelValue(normalized, ["Contact", "Contact Person", "Contact Name", "Representative"]);
  const services = detectServices(normalized);

  const pricingNotes = lineContaining(normalized, /\bprice|pricing|fee|rate|\$\s?\d|USD|EUR|PLN|GBP|AUD\b/i);
  const employerAccountClues = lineContaining(normalized, /employer account|company account|occupational health account|employer billing/i);
  const corporateBillingClues = lineContaining(normalized, /corporate billing|direct billing|bill(?:ing)? to company|invoice(?:d|s|ing)? employer/i);
  const netTermsClues = lineContaining(normalized, /\bnet\s*[- ]?\d{1,3}\b|payment terms|terms of payment/i);
  const paymentRequirements = lineContaining(normalized, /payment (?:is )?due|pay(?:ment)? at time of service|prepay|pre-payment|invoice|billing terms|credit card/i);
  const outsideFormsLine = lineContaining(normalized, /outside forms|employer forms|company forms|client forms|bring (?:your|employer) forms/i);
  const acceptsOutsideForms = outsideFormsLine ? "Evidence suggests outside/employer forms are accepted" : null;

  addField("clinicName", clinicName, clinicNameResult.confidence, clinicNameResult.snippet);
  if (clinicType) addField("clinicType", clinicType, "medium", lineContaining(normalized, /occupational|dental|laboratory|cardiology|urgent care|hospital|medical center|medical centre/i) || clinicType);
  if (address) addField("address", address, labelledAddress ? "high" : "medium", labelledAddress || address);
  if (city) addField("city", city, cityStateZip ? "medium" : "high", cityStateZip?.[0] || city);
  if (state) addField("state", state, cityStateZip ? "medium" : "high", cityStateZip?.[0] || state);
  if (zip) addField("zip", zip, "medium", cityStateZip?.[0] || zip);
  if (phone) addField("phone", phone, "high", lineContaining(normalized, /phone|telephone|tel\b/i) || phone);
  if (fax) addField("fax", fax, "high", lineContaining(normalized, /fax/i) || fax);
  if (email) addField("email", email, "high", email);
  if (website) addField("website", website, "high", website);
  if (contactPerson) addField("contactPerson", contactPerson, "medium", contactPerson);
  if (services.length) addField("servicesOffered", services.join(", "), "medium", `Detected service terms: ${services.join(", ")}`);
  if (pricingNotes) addField("pricingNotes", pricingNotes, "medium", pricingNotes);
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
      website,
      email,
      contactPerson,
      servicesOffered: services.length ? services.join(", ") : null,
      pricingNotes,
      employerAccountClues,
      corporateBillingClues,
      netTermsClues,
      acceptsOutsideForms,
      paymentRequirements,
    },
    fields,
  };
}

function buildFolderPath(extracted: ExtractedProvider, fileType: string) {
  const geography = [extracted.state, extracted.city].filter(Boolean).join(" - ") || "Unlocated";
  return [
    sanitizeFolderPart(geography, "Unlocated"),
    sanitizeFolderPart(extracted.clinicName, "Unknown Provider"),
    sanitizeFolderPart(fileType, "other"),
  ].join("/");
}

async function saveExtraction(args: {
  evidenceFile: typeof evidenceFilesTable.$inferSelect;
  extracted: ExtractedProvider;
  fields: ExtractedField[];
  extractedText: string;
  extractionMode: ExtractionMode;
  parseWarning?: string;
  fileType: string;
  category: string;
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
    fileType,
    category,
    issueType,
    description,
  } = args;

  const lowConfidence = fields.some((field) => field.confidenceLevel === "low");
  const sparseExtraction = fields.length < 3 || !extractedText;
  const needsReview = Boolean(parseWarning || lowConfidence || sparseExtraction);

  const [provider] = await db
    .insert(providersTable)
    .values({
      ...extracted,
      verificationStatus: needsReview ? "Needs Review" : "Auto Extracted",
      sourceCount: "1",
    })
    .returning();

  const folderPath = buildFolderPath(extracted, fileType);
  await db
    .update(evidenceFilesTable)
    .set({
      providerId: provider.id,
      processingStatus: extractedText ? (needsReview ? "Extracted - Review Suggested" : "Extracted") : "Needs Review",
      extractedText: extractedText || null,
      associatedProvider: extracted.clinicName,
      associatedCity: extracted.city ?? null,
      associatedState: extracted.state ?? null,
      category,
      sourceType: "Automatic Intake",
      folderPath,
    })
    .where(eq(evidenceFilesTable.id, evidenceFile.id));

  const insertedFields = fields.length
    ? await db
        .insert(extractedFieldsTable)
        .values(fields.map((field) => ({ ...field, evidenceFileId: evidenceFile.id, providerId: provider.id })))
        .returning()
    : [];

  let reviewItem: typeof reviewItemsTable.$inferSelect | undefined;
  if (needsReview) {
    [reviewItem] = await db
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
  }

  return { provider, insertedFields, reviewItem, extractionMode, parseWarning, needsReview, folderPath };
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

    const fileType = detectFileType(req.file.mimetype, req.file.originalname);

    try {
      const [evidenceFile] = await db
        .insert(evidenceFilesTable)
        .values({
          originalFilename: req.file.originalname,
          fileType,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          storagePath: req.file.path,
          sourceType: "Automatic Intake",
          folderPath: `Incoming/${sanitizeFolderPart(fileType, "other")}`,
          processingStatus: "Processing",
        })
        .returning();

      const source = await extractSourceText(req.file, fileType);
      const { extracted, fields } = extractProviderData(source.text, req.file.originalname);
      const category = inferCategory(source.text, req.file.originalname);
      const saved = await saveExtraction({
        evidenceFile,
        extracted,
        fields,
        extractedText: source.text,
        extractionMode: source.mode,
        parseWarning: source.warning,
        fileType,
        category,
        issueType: source.text ? "Automatic Extraction Review" : "Automatic Extraction Needs Review",
        description: source.text
          ? `Review only if needed: automatic local extraction from ${req.file.originalname}`
          : `Automatic local extraction could not recover usable text from ${req.file.originalname}`,
      });

      logger.info(
        {
          evidenceFileId: evidenceFile.id,
          providerId: saved.provider.id,
          extractionMode: source.mode,
          needsReview: saved.needsReview,
        },
        "File uploaded and processed through local automatic extraction",
      );

      res.status(201).json({
        evidenceFile: {
          ...evidenceFile,
          processingStatus: source.text ? (saved.needsReview ? "Extracted - Review Suggested" : "Extracted") : "Needs Review",
          providerId: saved.provider.id,
          associatedProvider: extracted.clinicName,
          associatedCity: extracted.city,
          associatedState: extracted.state,
          category,
          folderPath: saved.folderPath,
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
      logger.error({ err: error, filename: req.file.originalname }, "Automatic file intake failed");
      res.status(500).json({ error: error instanceof Error ? error.message : "Automatic file intake failed" });
    }
  },
);

router.post("/upload/paste", async (req, res): Promise<void> => {
  const body = UploadPastedTextBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { text } = body.data;
  const filename = `pasted-note-${Date.now()}.txt`;

  try {
    const normalizedText = cleanText(text);
    const [evidenceFile] = await db
      .insert(evidenceFilesTable)
      .values({
        originalFilename: filename,
        fileType: "text",
        mimeType: "text/plain",
        extractedText: normalizedText,
        sourceType: "Automatic Intake",
        folderPath: "Incoming/text",
        processingStatus: "Processing",
      })
      .returning();

    const { extracted, fields } = extractProviderData(normalizedText, filename);
    const category = inferCategory(normalizedText, filename);
    const saved = await saveExtraction({
      evidenceFile,
      extracted,
      fields,
      extractedText: normalizedText,
      extractionMode: "raw_text",
      fileType: "text",
      category,
      issueType: "Automatic Text Review",
      description: "Review only if needed: automatic extraction from pasted text",
    });

    res.status(201).json({
      evidenceFile: {
        ...evidenceFile,
        processingStatus: saved.needsReview ? "Extracted - Review Suggested" : "Extracted",
        providerId: saved.provider.id,
        associatedProvider: extracted.clinicName,
        associatedCity: extracted.city,
        associatedState: extracted.state,
        category,
        folderPath: saved.folderPath,
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
    logger.error({ err: error }, "Automatic pasted text intake failed");
    res.status(500).json({ error: error instanceof Error ? error.message : "Automatic pasted text intake failed" });
  }
});

export default router;
