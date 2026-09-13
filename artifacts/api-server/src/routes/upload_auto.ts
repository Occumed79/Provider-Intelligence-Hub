import { Router, type IRouter } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { eq } from "drizzle-orm";
import { db, evidenceFilesTable, providersTable, reviewItemsTable, extractedFieldsTable } from "@workspace/db";
import { UploadPastedTextBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { cleanExtractedText, extractDocumentText, type ExtractionMode } from "../lib/document-extraction";

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

type Field = { fieldName: string; fieldValue: string; confidenceLevel: "high" | "medium" | "low"; sourceSnippet: string };
type ProviderDraft = {
  clinicName: string; clinicType?: string | null; address?: string | null; city?: string | null; state?: string | null;
  zip?: string | null; phone?: string | null; fax?: string | null; website?: string | null; email?: string | null;
  servicesOffered?: string | null; pricingNotes?: string | null; employerAccountClues?: string | null;
  corporateBillingClues?: string | null; netTermsClues?: string | null; acceptsOutsideForms?: string | null;
  paymentRequirements?: string | null;
};

function fileType(mime: string, name: string) {
  const n = name.toLowerCase();
  if (mime.startsWith("image/") || /\.(png|jpe?g|webp)$/.test(n)) return "image";
  if (mime === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (mime.includes("spreadsheet") || mime.includes("excel") || /\.(xlsx?|csv)$/.test(n)) return "spreadsheet";
  if (mime.includes("word") || /\.docx?$/.test(n)) return "document";
  if (mime.startsWith("text/") || n.endsWith(".txt")) return "text";
  return "other";
}

function label(text: string, names: string[]) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = text.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*[:\\-]\\s*([^\\n]{2,180})`, "i"));
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function line(text: string, re: RegExp) { return text.split("\n").find((v) => re.test(v))?.trim().slice(0, 300) || null; }
function phone(text: string, name: string) {
  const m = text.match(new RegExp(`${name}\\s*[:\\-]?\\s*(\\+?[0-9][0-9(). \\-]{7,22}[0-9])`, "i"));
  return m?.[1]?.trim() || null;
}
function filenameName(name: string) {
  return path.basename(name, path.extname(name)).replace(/[_-]+/g, " ").replace(/\b(scan|document|upload|attachment|copy)\b/gi, " ").replace(/\s+/g, " ").trim() || "Unidentified Provider";
}
function safePart(value: string | null | undefined, fallback: string) { return String(value || "").replace(/[^a-zA-Z0-9 ._()-]/g, "").replace(/\s+/g, " ").trim() || fallback; }

function parseProvider(raw: string, filename: string) {
  const text = cleanExtractedText(raw);
  const fields: Field[] = [];
  const add = (fieldName: string, value: string | null | undefined, confidenceLevel: Field["confidenceLevel"], sourceSnippet?: string) => {
    if (value?.trim()) fields.push({ fieldName, fieldValue: value.trim(), confidenceLevel, sourceSnippet: (sourceSnippet || value).slice(0, 500) });
  };

  const labelledName = label(text, ["Clinic Name", "Provider Name", "Facility Name", "Organization", "Practice Name", "Company Name"]);
  const clinicName = labelledName || filenameName(filename);
  const cityStateZip = text.match(/\b([A-Za-z .'-]{2,60}),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  const address = label(text, ["Address", "Street Address", "Clinic Address", "Facility Address"]);
  const city = label(text, ["City", "Town", "Municipality"]) || cityStateZip?.[1]?.trim() || null;
  const state = label(text, ["State", "Province", "Region"]) || cityStateZip?.[2]?.trim() || null;
  const zip = label(text, ["ZIP", "Zip Code", "Postal Code", "Postcode"]) || cityStateZip?.[3]?.trim() || null;
  const p = phone(text, "(?:Phone|Telephone|Tel)");
  const fax = phone(text, "Fax");
  const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || null;
  const website = text.match(/https?:\/\/[^\s)>\]}]+|\bwww\.[^\s)>\]}]+/i)?.[0] || null;
  const services = [
    ["Physical Exams", /\bphysical exam|pre[- ]?employment physical|medical examination/i], ["Audiometry", /audiometr|audiogram|hearing test/i],
    ["Pulmonary Function Testing", /pulmonary function|spirometr|\bpft\b/i], ["EKG / ECG", /\bekg\b|\becg\b|electrocardiogram/i],
    ["Treadmill Stress Testing", /treadmill stress|exercise stress|stress test/i], ["Chest X-Ray", /chest x[- ]?ray|\bcxr\b/i],
    ["Laboratory Testing", /laboratory testing|blood work|\bcbc\b|urinalysis|chemistry panel/i], ["Vision Testing", /vision testing|visual acuity|color vision/i],
    ["Dental Evaluation", /dental evaluation|dental exam|panoramic x[- ]?ray|bitewing/i], ["Vaccinations", /vaccination|vaccine|immunization/i],
    ["Travel Medicine", /travel medicine/i], ["Respirator Fit Testing", /respirator fit|fit testing/i],
  ].filter(([, re]) => (re as RegExp).test(text)).map(([name]) => name as string);
  const clinicType = /occupational (health|medicine)|employee health/i.test(text) ? "Occupational Medicine Clinic"
    : /dental|dentistry/i.test(text) ? "Dental Clinic"
    : /cardiology|heart center/i.test(text) ? "Cardiology Practice"
    : /laboratory|diagnostic lab/i.test(text) ? "Laboratory / Diagnostic Center"
    : /hospital|medical center|medical centre/i.test(text) ? "Hospital / Medical Center" : null;
  const pricingNotes = line(text, /\bprice|pricing|fee|rate|\$\s?\d|USD|EUR|PLN|GBP|AUD\b/i);
  const employerAccountClues = line(text, /employer account|company account|occupational health account|employer billing/i);
  const corporateBillingClues = line(text, /corporate billing|direct billing|invoice(?:d|s|ing)? employer/i);
  const netTermsClues = line(text, /\bnet\s*[- ]?\d{1,3}\b|payment terms/i);
  const paymentRequirements = line(text, /payment (?:is )?due|time of service|prepay|pre-payment|invoice|billing terms/i);
  const outside = line(text, /outside forms|employer forms|company forms|client forms/i);
  const acceptsOutsideForms = outside ? "Evidence suggests outside/employer forms are accepted" : null;

  add("clinicName", clinicName, labelledName ? "high" : "medium"); add("clinicType", clinicType, "medium"); add("address", address, "high");
  add("city", city, cityStateZip ? "medium" : "high"); add("state", state, cityStateZip ? "medium" : "high"); add("zip", zip, "medium");
  add("phone", p, "high"); add("fax", fax, "high"); add("email", email, "high"); add("website", website, "high");
  if (services.length) add("servicesOffered", services.join(", "), "medium"); add("pricingNotes", pricingNotes, "medium");
  add("employerAccountClues", employerAccountClues, "medium"); add("corporateBillingClues", corporateBillingClues, "medium");
  add("netTermsClues", netTermsClues, "high"); add("paymentRequirements", paymentRequirements, "medium"); add("acceptsOutsideForms", acceptsOutsideForms, "medium", outside || undefined);

  const extracted: ProviderDraft = { clinicName, clinicType, address, city, state, zip, phone: p, fax, website, email, servicesOffered: services.length ? services.join(", ") : null, pricingNotes, employerAccountClues, corporateBillingClues, netTermsClues, acceptsOutsideForms, paymentRequirements };
  return { extracted, fields };
}

function category(text: string, filename: string) {
  const s = `${filename}\n${text.slice(0, 8000)}`;
  if (/pricing|fee schedule|rate sheet|self[- ]?pay|\bcpt\b/i.test(s)) return "Pricing";
  if (/provider service agreement|agreement|contract|terms and conditions/i.test(s)) return "Agreement";
  if (/follow[- ]?up|email thread|sent:|from:/i.test(s)) return "Outreach";
  return "Provider Research";
}

async function persist(evidenceFile: typeof evidenceFilesTable.$inferSelect, extracted: ProviderDraft, fields: Field[], text: string, mode: ExtractionMode | "raw_text", warning: string | undefined, kind: string) {
  const needsReview = Boolean(warning || fields.some((f) => f.confidenceLevel === "low") || fields.length < 3 || !text);
  const [provider] = await db.insert(providersTable).values({ ...extracted, verificationStatus: needsReview ? "Needs Review" : "Auto Extracted", sourceCount: "1" }).returning();
  const folderPath = [[extracted.state, extracted.city].filter(Boolean).join(" - ") || "Unlocated", extracted.clinicName, kind].map((v) => safePart(v, "Unknown")).join("/");
  const cat = category(text, evidenceFile.originalFilename);
  await db.update(evidenceFilesTable).set({ providerId: provider.id, processingStatus: text ? (needsReview ? "Extracted - Review Suggested" : "Extracted") : "Needs Review", extractedText: text || null, associatedProvider: extracted.clinicName, associatedCity: extracted.city || null, associatedState: extracted.state || null, category: cat, sourceType: "Automatic Intake", folderPath }).where(eq(evidenceFilesTable.id, evidenceFile.id));
  const insertedFields = fields.length ? await db.insert(extractedFieldsTable).values(fields.map((f) => ({ ...f, evidenceFileId: evidenceFile.id, providerId: provider.id }))).returning() : [];
  let reviewItem: typeof reviewItemsTable.$inferSelect | undefined;
  if (needsReview) [reviewItem] = await db.insert(reviewItemsTable).values({ reviewStatus: "pending", priority: text ? "normal" : "high", issueType: "Automatic Extraction Review", description: warning || "Review only if needed: automatic extraction", providerId: provider.id, evidenceFileId: evidenceFile.id, providerName: extracted.clinicName }).returning();
  return { provider, folderPath, cat, insertedFields, reviewItem, needsReview, mode };
}

const router: IRouter = Router();
router.post("/upload", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) return void res.status(400).json({ error: "No file provided" });
  const kind = fileType(req.file.mimetype, req.file.originalname);
  try {
    const [evidenceFile] = await db.insert(evidenceFilesTable).values({ originalFilename: req.file.originalname, fileType: kind, fileSize: req.file.size, mimeType: req.file.mimetype, storagePath: req.file.path, sourceType: "Automatic Intake", folderPath: `Incoming/${kind}`, processingStatus: "Processing" }).returning();
    const source = await extractDocumentText(req.file, kind);
    const { extracted, fields } = parseProvider(source.text, req.file.originalname);
    const saved = await persist(evidenceFile, extracted, fields, source.text, source.mode, source.warning, kind);
    logger.info({ evidenceFileId: evidenceFile.id, providerId: saved.provider.id, extractionMode: source.mode }, "Automatic OCR intake complete");
    res.status(201).json({ evidenceFile: { ...evidenceFile, providerId: saved.provider.id, associatedProvider: extracted.clinicName, associatedCity: extracted.city, associatedState: extracted.state, category: saved.cat, folderPath: saved.folderPath, processingStatus: saved.needsReview ? "Extracted - Review Suggested" : "Extracted", uploadDate: evidenceFile.createdAt }, extractedProvider: { ...saved.provider, sourceCount: 1 }, reviewItem: saved.reviewItem, extractionSimulated: false, extractionMode: saved.mode, parseWarning: source.warning || null, extractedFields: saved.insertedFields });
  } catch (error) {
    logger.error({ err: error, filename: req.file.originalname }, "Automatic OCR intake failed");
    res.status(500).json({ error: error instanceof Error ? error.message : "Automatic OCR intake failed" });
  }
});

router.post("/upload/paste", async (req, res): Promise<void> => {
  const parsed = UploadPastedTextBody.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: parsed.error.message });
  const text = cleanExtractedText(parsed.data.text);
  const filename = `pasted-note-${Date.now()}.txt`;
  try {
    const [evidenceFile] = await db.insert(evidenceFilesTable).values({ originalFilename: filename, fileType: "text", mimeType: "text/plain", extractedText: text, sourceType: "Automatic Intake", folderPath: "Incoming/text", processingStatus: "Processing" }).returning();
    const { extracted, fields } = parseProvider(text, filename);
    const saved = await persist(evidenceFile, extracted, fields, text, "raw_text", undefined, "text");
    res.status(201).json({ evidenceFile: { ...evidenceFile, providerId: saved.provider.id, associatedProvider: extracted.clinicName, category: saved.cat, folderPath: saved.folderPath, processingStatus: saved.needsReview ? "Extracted - Review Suggested" : "Extracted", uploadDate: evidenceFile.createdAt }, extractedProvider: { ...saved.provider, sourceCount: 1 }, reviewItem: saved.reviewItem, extractionSimulated: false, extractionMode: "raw_text", parseWarning: null, extractedFields: saved.insertedFields });
  } catch (error) {
    logger.error({ err: error }, "Automatic pasted text intake failed");
    res.status(500).json({ error: error instanceof Error ? error.message : "Automatic pasted text intake failed" });
  }
});

export default router;
