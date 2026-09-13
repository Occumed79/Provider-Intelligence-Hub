import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";

export type ExtractionMode =
  | "local_text"
  | "local_spreadsheet"
  | "local_docx"
  | "local_pdf"
  | "local_pdf_ocr"
  | "local_image_ocr"
  | "cloud_llamacloud"
  | "cloud_azure"
  | "cloud_ocrspace"
  | "metadata_only";

export type ExtractionResult = {
  text: string;
  mode: ExtractionMode;
  warning?: string;
};

const MAX_TEXT = 180_000;
const MIN_PDF_TEXT = 90;
const MAX_LOCAL_OCR_PAGES = 10;
const LLAMA_BASE = "https://api.cloud.llamaindex.ai";
const OCRSPACE_URL = "https://api.ocr.space/parse/image";

export function cleanExtractedText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, MAX_TEXT);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function localOcr(images: Array<string | Buffer | Uint8Array>) {
  if (!images.length) return "";
  const worker = await createWorker("eng");
  try {
    const parts: string[] = [];
    for (const image of images) {
      const { data } = await worker.recognize(image as any);
      const text = cleanExtractedText(data.text || "");
      if (text) parts.push(text);
    }
    return cleanExtractedText(parts.join("\n\n--- OCR PAGE ---\n\n"));
  } finally {
    await worker.terminate();
  }
}

async function llamaCloud(buffer: Buffer, mimeType: string, filename: string) {
  const key = process.env.LLAMA_CLOUD_API_KEY?.trim();
  if (!key) return null;

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType || "application/octet-stream" }), filename);
  form.append("configuration", JSON.stringify({ tier: "cost_effective", version: "latest" }));
  const create = await fetch(`${LLAMA_BASE}/api/v2/parse/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
    signal: AbortSignal.timeout(45_000),
  });
  if (!create.ok) throw new Error(`LlamaCloud returned ${create.status}`);
  const created = await create.json() as { id?: string; status?: string; text_full?: string; error_message?: string | null };
  if (created.status === "COMPLETED" && created.text_full) return cleanExtractedText(created.text_full);
  if (!created.id) throw new Error("LlamaCloud did not return a job id");

  const deadline = Date.now() + 75_000;
  while (Date.now() < deadline) {
    await sleep(900);
    const response = await fetch(`${LLAMA_BASE}/api/v2/parse/${encodeURIComponent(created.id)}?expand=text_full`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`LlamaCloud status returned ${response.status}`);
    const job = await response.json() as { status?: string; text_full?: string; error_message?: string | null };
    if (job.status === "COMPLETED") return cleanExtractedText(job.text_full || "");
    if (job.status === "FAILED" || job.status === "CANCELLED") throw new Error(job.error_message || "LlamaCloud job failed");
  }
  throw new Error("LlamaCloud timed out");
}

async function azureOcr(buffer: Buffer, mimeType: string) {
  const key = process.env.AZURE_OCR_API_KEY?.trim();
  const endpoint = process.env.AZURE_OCR_ENDPOINT?.trim()?.replace(/\/$/, "");
  if (!key || !endpoint) return null;

  const submit = await fetch(`${endpoint}/vision/v3.2/read/analyze?readingOrder=natural`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": mimeType || "application/octet-stream",
    },
    body: new Uint8Array(buffer),
    signal: AbortSignal.timeout(45_000),
  });
  if (!submit.ok) throw new Error(`Azure OCR returned ${submit.status}`);
  const operationLocation = submit.headers.get("operation-location");
  if (!operationLocation) throw new Error("Azure OCR did not return Operation-Location");

  const deadline = Date.now() + 75_000;
  while (Date.now() < deadline) {
    await sleep(1_200);
    const response = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": key },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`Azure OCR status returned ${response.status}`);
    const job = await response.json() as {
      status?: string;
      analyzeResult?: { readResults?: Array<{ lines?: Array<{ text?: string }> }> };
    };
    if (job.status === "succeeded") {
      return cleanExtractedText((job.analyzeResult?.readResults || [])
        .map((page) => (page.lines || []).map((line) => line.text || "").filter(Boolean).join("\n"))
        .filter(Boolean)
        .join("\n\n--- OCR PAGE ---\n\n"));
    }
    if (job.status === "failed") throw new Error("Azure OCR job failed");
  }
  throw new Error("Azure OCR timed out");
}

async function ocrSpace(buffer: Buffer, mimeType: string, filename: string) {
  const key = process.env.OCRSPACE_API_KEY?.trim();
  if (!key) return null;
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType || "application/octet-stream" }), filename);
  form.append("language", "eng");
  form.append("isOverlayRequired", "false");
  form.append("OCREngine", "2");
  const response = await fetch(OCRSPACE_URL, {
    method: "POST",
    headers: { apikey: key },
    body: form,
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`OCR.Space returned ${response.status}`);
  const json = await response.json() as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string | string[];
    ParsedResults?: Array<{ ParsedText?: string }>;
  };
  if (json.IsErroredOnProcessing) {
    const message = Array.isArray(json.ErrorMessage) ? json.ErrorMessage.join("; ") : String(json.ErrorMessage || "OCR.Space failed");
    throw new Error(message);
  }
  return cleanExtractedText((json.ParsedResults || []).map((item) => item.ParsedText || "").filter(Boolean).join("\n\n--- OCR PAGE ---\n\n"));
}

async function cloudCascade(buffer: Buffer, mimeType: string, filename: string, fileType: string) {
  const attempts = fileType === "pdf"
    ? [
        ["cloud_llamacloud", () => llamaCloud(buffer, mimeType, filename)],
        ["cloud_azure", () => azureOcr(buffer, mimeType)],
        ["cloud_ocrspace", () => ocrSpace(buffer, mimeType, filename)],
      ] as const
    : [
        ["cloud_azure", () => azureOcr(buffer, mimeType)],
        ["cloud_ocrspace", () => ocrSpace(buffer, mimeType, filename)],
        ["cloud_llamacloud", () => llamaCloud(buffer, mimeType, filename)],
      ] as const;

  const errors: string[] = [];
  for (const [mode, run] of attempts) {
    try {
      const text = await run();
      if (text) return { text, mode } as ExtractionResult;
    } catch (error) {
      errors.push(`${mode}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return errors.length ? { text: "", mode: "metadata_only" as const, warning: errors.join(" | ").slice(0, 1000) } : null;
}

async function parsePdf(file: Express.Multer.File): Promise<ExtractionResult> {
  const buffer = await fs.promises.readFile(file.path);
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText({ parseHyperlinks: true });
    const embedded = cleanExtractedText(result.text || "");
    if (embedded.length >= MIN_PDF_TEXT) return { text: embedded, mode: "local_pdf" };

    const cloud = await cloudCascade(buffer, file.mimetype, file.originalname, "pdf");
    if (cloud?.text) return cloud;

    const rendered = await parser.getScreenshot({ desiredWidth: 1600, first: MAX_LOCAL_OCR_PAGES });
    const pages = rendered.pages
      .map((page: any) => page?.data)
      .filter(Boolean)
      .map((data: any) => Buffer.isBuffer(data) ? data : Buffer.from(data));
    const local = await localOcr(pages);
    if (local) return { text: local, mode: "local_pdf_ocr" };
    return { text: embedded, mode: "local_pdf", warning: cloud?.warning || "No readable PDF text was recovered" };
  } finally {
    await parser.destroy();
  }
}

export async function extractDocumentText(file: Express.Multer.File, fileType: string): Promise<ExtractionResult> {
  try {
    if (fileType === "text") {
      return { text: cleanExtractedText(await fs.promises.readFile(file.path, "utf8")), mode: "local_text" };
    }
    if (fileType === "spreadsheet") {
      const workbook = XLSX.readFile(file.path, { cellDates: false, cellFormula: false });
      const chunks = workbook.SheetNames.map((name) => `# Sheet: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name], { blankrows: false })}`);
      return { text: cleanExtractedText(chunks.join("\n\n")), mode: "local_spreadsheet" };
    }
    if (fileType === "document") {
      if (path.extname(file.originalname).toLowerCase() !== ".docx") {
        return { text: "", mode: "metadata_only", warning: "Legacy .doc is not supported" };
      }
      const result = await mammoth.extractRawText({ path: file.path });
      return { text: cleanExtractedText(result.value || ""), mode: "local_docx" };
    }
    if (fileType === "pdf") return parsePdf(file);
    if (fileType === "image") {
      const buffer = await fs.promises.readFile(file.path);
      const cloud = await cloudCascade(buffer, file.mimetype, file.originalname, "image");
      if (cloud?.text) return cloud;
      const local = await localOcr([file.path]);
      return { text: local, mode: "local_image_ocr", warning: local ? undefined : cloud?.warning || "No readable image text was recovered" };
    }
    return { text: "", mode: "metadata_only", warning: "Unsupported file type" };
  } catch (error) {
    return { text: "", mode: "metadata_only", warning: error instanceof Error ? error.message : "Document extraction failed" };
  }
}
