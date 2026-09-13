import path from "node:path";

type CloudOcrProvider = "llamacloud" | "ocrspace" | "azure";

export type CloudOcrResult = {
  text: string;
  provider: CloudOcrProvider;
  credentialSlot: number;
  warning?: string;
};

type KeySlot = {
  key: string;
  slot: number;
};

type AzureSlot = KeySlot & {
  endpoint: string;
};

type AttemptError = Error & {
  status?: number;
  quotaLike?: boolean;
};

const LLAMA_BASE_URL = "https://api.cloud.llamaindex.ai";
const OCRSPACE_URL = "https://api.ocr.space/parse/image";
const POLL_TIMEOUT_MS = 75_000;

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function envName(base: string, slot: number) {
  return slot === 1 ? base : `${base}_${slot}`;
}

function keyPool(base: string): KeySlot[] {
  const items: KeySlot[] = [];
  for (let slot = 1; slot <= 5; slot += 1) {
    const key = process.env[envName(base, slot)]?.trim();
    if (key) items.push({ key, slot });
  }
  return items;
}

function azurePool(): AzureSlot[] {
  const defaultEndpoint = process.env.AZURE_OCR_ENDPOINT?.trim() || "";
  const items: AzureSlot[] = [];
  for (let slot = 1; slot <= 5; slot += 1) {
    const key = process.env[envName("AZURE_OCR_API_KEY", slot)]?.trim();
    if (!key) continue;
    const endpoint = process.env[envName("AZURE_OCR_ENDPOINT", slot)]?.trim() || defaultEndpoint;
    if (endpoint) items.push({ key, endpoint: endpoint.replace(/\/$/, ""), slot });
  }
  return items;
}

function makeError(message: string, status?: number, quotaLike = false): AttemptError {
  const error = new Error(message) as AttemptError;
  error.status = status;
  error.quotaLike = quotaLike;
  return error;
}

function isQuotaLike(status?: number, body?: string) {
  if (status === 402 || status === 429) return true;
  return /quota|rate.?limit|too many requests|credits? exhausted|usage limit/i.test(body || "");
}

function shouldTryStandbyCredential(error: unknown) {
  const typed = error as AttemptError;
  if (typed?.quotaLike) return false;
  if (typed?.status === 401) return true;
  if (typed?.status && typed.status >= 500) return true;
  return !typed?.status;
}

async function attemptCredentialPool<T extends KeySlot>(
  credentials: T[],
  run: (credential: T) => Promise<CloudOcrResult>,
): Promise<CloudOcrResult | null> {
  for (let index = 0; index < credentials.length; index += 1) {
    const credential = credentials[index];
    try {
      return await run(credential);
    } catch (error) {
      if (!shouldTryStandbyCredential(error) || index === credentials.length - 1) throw error;
    }
  }
  return null;
}

async function llamaParse(
  fileBuffer: Buffer,
  mimeType: string,
  filename: string,
  credential: KeySlot,
): Promise<CloudOcrResult> {
  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: mimeType || "application/octet-stream" }), filename);
  form.append("configuration", JSON.stringify({ tier: "cost_effective", version: "latest" }));

  const createResponse = await fetch(`${LLAMA_BASE_URL}/api/v2/parse/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${credential.key}` },
    body: form,
    signal: AbortSignal.timeout(45_000),
  });
  const createBody = await createResponse.text();
  if (!createResponse.ok) {
    throw makeError(
      `LlamaCloud parse upload failed (${createResponse.status}): ${createBody.slice(0, 300)}`,
      createResponse.status,
      isQuotaLike(createResponse.status, createBody),
    );
  }

  const createJson = JSON.parse(createBody) as {
    id?: string;
    status?: string;
    error_message?: string | null;
    text_full?: string;
  };
  if (createJson.status === "COMPLETED" && createJson.text_full) {
    return { text: cleanText(createJson.text_full), provider: "llamacloud", credentialSlot: credential.slot };
  }
  if (!createJson.id) throw makeError("LlamaCloud did not return a parse job id.");

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(900);
    const response = await fetch(`${LLAMA_BASE_URL}/api/v2/parse/${encodeURIComponent(createJson.id)}?expand=text_full`, {
      headers: { Authorization: `Bearer ${credential.key}` },
      signal: AbortSignal.timeout(20_000),
    });
    const body = await response.text();
    if (!response.ok) {
      throw makeError(
        `LlamaCloud parse status failed (${response.status}): ${body.slice(0, 300)}`,
        response.status,
        isQuotaLike(response.status, body),
      );
    }
    const json = JSON.parse(body) as {
      status?: string;
      error_message?: string | null;
      text_full?: string;
    };
    if (json.status === "COMPLETED") {
      return { text: cleanText(json.text_full || ""), provider: "llamacloud", credentialSlot: credential.slot };
    }
    if (json.status === "FAILED" || json.status === "CANCELLED") {
      throw makeError(json.error_message || `LlamaCloud parse job ${String(json.status).toLowerCase()}.`);
    }
  }

  throw makeError("LlamaCloud parse job timed out.");
}

async function ocrSpace(
  fileBuffer: Buffer,
  mimeType: string,
  filename: string,
  credential: KeySlot,
): Promise<CloudOcrResult> {
  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: mimeType || "application/octet-stream" }), filename);
  form.append("language", "eng");
  form.append("isOverlayRequired", "false");
  form.append("OCREngine", "2");

  const response = await fetch(OCRSPACE_URL, {
    method: "POST",
    headers: { apikey: credential.key },
    body: form,
    signal: AbortSignal.timeout(60_000),
  });
  const body = await response.text();
  if (!response.ok) {
    throw makeError(
      `OCR.Space failed (${response.status}): ${body.slice(0, 300)}`,
      response.status,
      isQuotaLike(response.status, body),
    );
  }

  const json = JSON.parse(body) as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string | string[];
    ParsedResults?: Array<{ ParsedText?: string; ErrorMessage?: string }>;
  };
  if (json.IsErroredOnProcessing) {
    const message = Array.isArray(json.ErrorMessage) ? json.ErrorMessage.join("; ") : String(json.ErrorMessage || "OCR.Space processing failed");
    throw makeError(message, undefined, isQuotaLike(undefined, message));
  }

  const text = cleanText((json.ParsedResults || []).map((item) => item.ParsedText || "").filter(Boolean).join("\n\n--- OCR PAGE ---\n\n"));
  if (!text) throw makeError("OCR.Space returned no readable text.");
  return { text, provider: "ocrspace", credentialSlot: credential.slot };
}

async function azureRead(
  fileBuffer: Buffer,
  mimeType: string,
  _filename: string,
  credential: AzureSlot,
): Promise<CloudOcrResult> {
  const analyzeUrl = `${credential.endpoint}/vision/v3.2/read/analyze?readingOrder=natural`;
  const response = await fetch(analyzeUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": credential.key,
      "Content-Type": mimeType || "application/octet-stream",
    },
    body: fileBuffer,
    signal: AbortSignal.timeout(45_000),
  });
  const responseBody = await response.text();
  if (!response.ok) {
    throw makeError(
      `Azure OCR submit failed (${response.status}): ${responseBody.slice(0, 300)}`,
      response.status,
      isQuotaLike(response.status, responseBody),
    );
  }

  const operationLocation = response.headers.get("operation-location");
  if (!operationLocation) throw makeError("Azure OCR did not return Operation-Location.");

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(1_200);
    const poll = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": credential.key },
      signal: AbortSignal.timeout(20_000),
    });
    const body = await poll.text();
    if (!poll.ok) {
      throw makeError(
        `Azure OCR status failed (${poll.status}): ${body.slice(0, 300)}`,
        poll.status,
        isQuotaLike(poll.status, body),
      );
    }

    const json = JSON.parse(body) as {
      status?: string;
      analyzeResult?: {
        readResults?: Array<{ lines?: Array<{ text?: string }> }>;
      };
    };
    if (json.status === "succeeded") {
      const text = cleanText((json.analyzeResult?.readResults || [])
        .map((page) => (page.lines || []).map((line) => line.text || "").filter(Boolean).join("\n"))
        .filter(Boolean)
        .join("\n\n--- OCR PAGE ---\n\n"));
      if (!text) throw makeError("Azure OCR completed but returned no readable text.");
      return { text, provider: "azure", credentialSlot: credential.slot };
    }
    if (json.status === "failed") throw makeError("Azure OCR job failed.");
  }

  throw makeError("Azure OCR job timed out.");
}

export function cloudOcrConfigured() {
  return keyPool("LLAMA_CLOUD_API_KEY").length > 0 || keyPool("OCRSPACE_API_KEY").length > 0 || azurePool().length > 0;
}

export async function tryCloudOcr(args: {
  fileBuffer: Buffer;
  mimeType: string;
  filename: string;
  fileType: string;
}): Promise<CloudOcrResult | null> {
  const { fileBuffer, mimeType, filename, fileType } = args;
  const llama = keyPool("LLAMA_CLOUD_API_KEY");
  const space = keyPool("OCRSPACE_API_KEY");
  const azure = azurePool();

  const order: CloudOcrProvider[] = fileType === "pdf"
    ? ["llamacloud", "azure", "ocrspace"]
    : ["azure", "ocrspace", "llamacloud"];

  const errors: string[] = [];
  for (const provider of order) {
    try {
      if (provider === "llamacloud" && llama.length) {
        const result = await attemptCredentialPool(llama, (credential) => llamaParse(fileBuffer, mimeType, filename, credential));
        if (result?.text) return result;
      }
      if (provider === "azure" && azure.length) {
        const result = await attemptCredentialPool(azure, (credential) => azureRead(fileBuffer, mimeType, filename, credential));
        if (result?.text) return result;
      }
      if (provider === "ocrspace" && space.length) {
        const result = await attemptCredentialPool(space, (credential) => ocrSpace(fileBuffer, mimeType, filename, credential));
        if (result?.text) return result;
      }
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (errors.length) {
    return {
      text: "",
      provider: order.find((provider) => provider === "llamacloud" && llama.length || provider === "azure" && azure.length || provider === "ocrspace" && space.length) || "azure",
      credentialSlot: 0,
      warning: errors.join(" | ").slice(0, 1200),
    };
  }
  return null;
}

export function describeCloudOcrConfig() {
  return {
    llamaCloudKeys: keyPool("LLAMA_CLOUD_API_KEY").length,
    ocrSpaceKeys: keyPool("OCRSPACE_API_KEY").length,
    azureKeysWithEndpoints: azurePool().length,
    azureEndpointConfigured: Boolean(process.env.AZURE_OCR_ENDPOINT?.trim()),
    note: path.basename(process.cwd()),
  };
}
