import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function frontendDistFromRuntime(runtimeDir: string) {
  return path.resolve(
    runtimeDir,
    "..",
    "..",
    "occu-med-hub",
    "dist",
    "public",
  );
}

export function resolveFrontendDist(moduleUrl = import.meta.url) {
  const runtimeDir = path.dirname(fileURLToPath(moduleUrl));
  const frontendDist = frontendDistFromRuntime(runtimeDir);
  const indexFile = path.join(frontendDist, "index.html");

  if (!fs.existsSync(indexFile)) {
    throw new Error(
      `Frontend build output is missing: expected ${indexFile}. Build @workspace/occu-med-hub before starting the unified service.`,
    );
  }

  return frontendDist;
}
