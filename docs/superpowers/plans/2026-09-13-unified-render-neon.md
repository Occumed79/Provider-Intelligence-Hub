# Unified Render + Neon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the Provider Intelligence Hub into one Render Node web service that serves both the React/Vite frontend and Express API while preserving the existing Neon PostgreSQL database and OCR pipeline.

**Architecture:** Keep the monorepo structure intact. Build the frontend into `artifacts/occu-med-hub/dist/public`, build the API into `artifacts/api-server/dist`, and have Express serve the frontend after mounting `/api/*` routes. Production database access remains through one Neon `DATABASE_URL`, enforced by a production-only Neon hostname guard.

**Tech Stack:** React 19, Vite, Express 5, TypeScript, pnpm, Drizzle ORM, node-postgres, Neon PostgreSQL, Render Web Service, LlamaCloud, OCR.Space, Optiic, Tesseract.js.

**Spec:** `docs/superpowers/specs/2026-09-13-unified-render-neon-design.md`

## Global Constraints

- Preserve the current UI; no visual redesign.
- Create one Render Node web service named `Network-Development-Hub`.
- Production database provider is Neon PostgreSQL only.
- Reuse the existing live database; do not silently create an empty replacement database.
- Keep OCR/database secrets server-side only.
- Keep `/api/*` responses JSON and browser routes SPA-backed.
- Do not delete the two existing Render services until the replacement passes runtime verification.
- Do not add a second database provider, Render Postgres, SQLite, Supabase, or another persistence layer.
- Do not add automatic same-provider key rotation to bypass free-tier quotas.

---

## File Structure

- `artifacts/api-server/src/app.ts` — API middleware ordering, static frontend serving, SPA fallback, API 404 behavior.
- `artifacts/api-server/src/lib/frontend.ts` — resolve and validate the compiled frontend path without mixing path logic into the Express app.
- `Lib/db/src/index.ts` — production Neon-only `DATABASE_URL` validation before creating the pool.
- `artifacts/occu-med-hub/src/main.tsx` — retain optional base URL behavior; no production-specific remote API requirement.
- `render.yaml` — replace the two-service topology with one Node web service definition.
- `.env.example` — document one-service environment variables and remove split-service-only variables.
- `DEPLOYMENT.md` — document one-service Render + Neon deployment and cutover procedure.
- `docs/superpowers/specs/2026-09-13-unified-render-neon-design.md` — approved design, unchanged unless implementation discovers a contradiction.

---

### Task 1: Add focused frontend-path and Neon validation helpers

**Files:**
- Create: `artifacts/api-server/src/lib/frontend.ts`
- Modify: `Lib/db/src/index.ts`
- Test: use repository typecheck/build commands plus direct Node smoke commands because the repo currently has no unit-test framework configured.

**Interfaces:**
- Produces: `resolveFrontendDist(): string`
- Produces: `validateProductionDatabaseUrl(rawUrl: string, nodeEnv?: string): void`
- Consumes: `process.cwd()`, `process.env.DATABASE_URL`, `process.env.NODE_ENV`

- [ ] **Step 1: Add the frontend dist resolver**

Create `artifacts/api-server/src/lib/frontend.ts` with:

```ts
import fs from "node:fs";
import path from "node:path";

export function resolveFrontendDist() {
  const frontendDist = path.resolve(
    process.cwd(),
    "artifacts",
    "occu-med-hub",
    "dist",
    "public",
  );

  const indexFile = path.join(frontendDist, "index.html");
  if (!fs.existsSync(indexFile)) {
    throw new Error(
      `Frontend build output is missing: expected ${indexFile}. Build @workspace/occu-med-hub before starting the unified service.`,
    );
  }

  return frontendDist;
}
```

- [ ] **Step 2: Add a production-only Neon URL guard**

Change `Lib/db/src/index.ts` so database validation occurs before `new Pool(...)`:

```ts
export function validateProductionDatabaseUrl(
  rawUrl: string,
  nodeEnv = process.env.NODE_ENV,
) {
  if (nodeEnv !== "production") return;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL URL.");
  }

  if (!parsed.hostname.endsWith(".neon.tech")) {
    throw new Error(
      "Production DATABASE_URL must point to Neon PostgreSQL (*.neon.tech).",
    );
  }
}
```

Then call:

```ts
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set.");
}

validateProductionDatabaseUrl(databaseUrl);
export const pool = new Pool({ connectionString: databaseUrl });
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
pnpm --filter @workspace/api-server typecheck
pnpm --filter @workspace/db typecheck
```

Expected: both commands exit 0.

- [ ] **Step 4: Smoke-test the Neon guard**

Run a temporary Node/tsx-compatible check through the repository TypeScript build or a small `node -e` equivalent that asserts:

```text
production + *.neon.tech => accepted
production + localhost => rejected
non-production + localhost => accepted
```

Expected: all three assertions behave exactly as above.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/lib/frontend.ts Lib/db/src/index.ts
git commit -m "feat: enforce unified frontend and Neon runtime assumptions"
```

---

### Task 2: Make Express serve the React app and preserve API semantics

**Files:**
- Modify: `artifacts/api-server/src/app.ts`
- Consume: `artifacts/api-server/src/lib/frontend.ts`

**Interfaces:**
- Consumes: `resolveFrontendDist(): string`
- Produces runtime routes:
  - `/api/*` => existing API router
  - static assets => `express.static(frontendDist)`
  - non-API browser routes => `index.html`
  - unmatched `/api/*` => JSON 404

- [ ] **Step 1: Preserve API middleware before static serving**

Refactor `app.ts` so the order is:

```ts
app.use(pinoHttp(...));
app.use(cors(...));
app.use(express.json(...));
app.use(express.urlencoded(...));

app.get("/api/health", ...);
app.head("/api/health", ...);
app.use("/api", router);
```

Do not place `express.static` before `/api`.

- [ ] **Step 2: Add JSON API 404 handling**

Immediately after `app.use("/api", router)`, add:

```ts
app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested Network Development Hub API route does not exist.",
  });
});
```

- [ ] **Step 3: Serve the built frontend and SPA fallback**

Add:

```ts
const frontendDist = resolveFrontendDist();
app.use(express.static(frontendDist));

app.get("*splat", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});
```

Import `path` and `resolveFrontendDist`.

Remove the old root API JSON response and old global JSON 404 because `/` is now the application shell and non-API routes must return `index.html`.

- [ ] **Step 4: Build both packages locally**

Run:

```bash
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/occu-med-hub build
pnpm --filter @workspace/api-server build
```

Expected: both builds exit 0 and `artifacts/occu-med-hub/dist/public/index.html` exists.

- [ ] **Step 5: Start the unified service with a non-production local PostgreSQL-compatible test environment only if a safe local/test DB is available**

Run:

```bash
NODE_ENV=development PORT=3000 DATABASE_URL="$TEST_DATABASE_URL" pnpm --filter @workspace/api-server start
```

Then verify:

```bash
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/network-development
curl -s http://127.0.0.1:3000/api/health
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/not-a-real-route
```

Expected:

```text
/ => 200 HTML
/network-development => 200 HTML
/api/health => 200 JSON
/api/not-a-real-route => 404 JSON
```

Do not point this smoke test at an unconfirmed production database.

- [ ] **Step 6: Commit**

```bash
git add artifacts/api-server/src/app.ts
git commit -m "feat: serve frontend and API from one Express service"
```

---

### Task 3: Replace the Render two-service definition with one service

**Files:**
- Modify: `render.yaml`
- Modify: `.env.example`
- Modify: `DEPLOYMENT.md`

**Interfaces:**
- Produces one Render service named `Network-Development-Hub`.
- Uses same-origin API calls, so production does not require `VITE_API_BASE_URL`.
- Requires server-side `DATABASE_URL` and OCR secrets.

- [ ] **Step 1: Rewrite `render.yaml` as one Node service**

Use:

```yaml
services:
  - type: web
    name: Network-Development-Hub
    runtime: node
    repo: https://github.com/Occumed79/Provider-Intelligence-Hub
    branch: main
    plan: free
    buildCommand: >-
      corepack enable &&
      pnpm install --no-frozen-lockfile --ignore-scripts=false &&
      pnpm rebuild esbuild &&
      PORT=3000 BASE_PATH=/ pnpm --filter @workspace/occu-med-hub build &&
      pnpm --filter @workspace/api-server build
    startCommand: >-
      pnpm --filter @workspace/db push &&
      pnpm --filter @workspace/api-server start
    envVars:
      - key: NODE_VERSION
        value: 22
      - key: NODE_ENV
        value: production
      - key: BASE_PATH
        value: /
      - key: DATABASE_URL
        sync: false
      - key: LLAMA_CLOUD_API_KEY
        sync: false
      - key: LLAMA_CLOUD_API_KEY_2
        sync: false
      - key: LLAMA_CLOUD_API_KEY_3
        sync: false
      - key: LLAMA_CLOUD_API_KEY_4
        sync: false
      - key: LLAMA_CLOUD_API_KEY_5
        sync: false
      - key: OCRSPACE_API_KEY
        sync: false
      - key: OCRSPACE_API_KEY_2
        sync: false
      - key: OCRSPACE_API_KEY_3
        sync: false
      - key: OCRSPACE_API_KEY_4
        sync: false
      - key: OCRSPACE_API_KEY_5
        sync: false
      - key: OPTIIC_API_KEY
        sync: false
      - key: OPTIIC_API_KEY_2
        sync: false
      - key: OPTIIC_API_KEY_3
        sync: false
      - key: OPTIIC_API_KEY_4
        sync: false
```

Do not define a second frontend service.

- [ ] **Step 2: Simplify `.env.example`**

Document only one runtime and remove split-service-only production requirements:

```text
NODE_VERSION=22
NODE_ENV=production
PORT=3000
BASE_PATH=/
DATABASE_URL=postgresql://...neon.tech/...?...sslmode=verify-full
```

Keep the existing OCR key names. Remove `FRONTEND_ORIGIN` and production `VITE_API_BASE_URL` requirements. Add a comment that `VITE_API_BASE_URL` is optional for local/split development only.

- [ ] **Step 3: Rewrite `DEPLOYMENT.md` around one Render service**

Document:

```text
Repository: Occumed79/Provider-Intelligence-Hub
Service: Network-Development-Hub
Runtime: Node
Database: existing Neon PostgreSQL only
Frontend and API: same origin
API path prefix: /api
```

Include cutover rule: old Render services remain until the unified service passes verification.

- [ ] **Step 4: Validate YAML and build command assumptions**

Run a YAML parse check and then:

```bash
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/occu-med-hub build
pnpm --filter @workspace/api-server build
```

Expected: valid YAML and both builds succeed.

- [ ] **Step 5: Commit**

```bash
git add render.yaml .env.example DEPLOYMENT.md
git commit -m "chore: define single Render web service deployment"
```

---

### Task 4: Identify the exact existing Neon database without guessing

**Files:**
- No application code changes unless a diagnostic script is proven necessary.
- Tooling: Render logs/environment metadata where available, Neon project inspection, GitHub schema files.

**Interfaces:**
- Produces: one confirmed Neon project/branch/database and connection string for the current live Provider Intelligence Hub.
- Must not use `mute-thunder-26929974` merely because it contains a `providers` table.

- [ ] **Step 1: Derive the expected schema signature from `Lib/db/src/schema`**

Expected table set includes at least:

```text
app_settings
audit_events
currency_fee_schedules
difficulty_reports
evidence_files
extracted_fields
outreach_records
provider_invites
providers
review_items
secure_messages
```

- [ ] **Step 2: Inspect candidate Neon projects read-only**

For each plausible project, run:

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Reject candidates missing the schema signature.

- [ ] **Step 3: Compare representative row counts for surviving candidates**

Run:

```sql
SELECT
  (SELECT count(*) FROM providers) AS providers,
  (SELECT count(*) FROM outreach_records) AS outreach_records,
  (SELECT count(*) FROM evidence_files) AS evidence_files,
  (SELECT count(*) FROM review_items) AS review_items;
```

Compare against the current live API endpoints where equivalent counts can be read safely.

- [ ] **Step 4: Confirm the live API's actual Neon host if Render environment introspection exposes a redacted/non-secret hostname**

Use only metadata that does not expose secrets. If Render cannot reveal enough to prove the connection, do not guess; obtain the existing `DATABASE_URL` through the authorized Render environment path or Neon connector connection-string lookup once the correct project is proven.

- [ ] **Step 5: Record the confirmed project ID/branch/database in deployment notes, never the password**

Add only non-secret identifiers to `DEPLOYMENT.md`, for example:

```text
Neon project ID: <confirmed-id>
Neon branch: <confirmed-branch-name>
Database: <confirmed-database-name>
```

Do not commit a connection string or password.

- [ ] **Step 6: Commit documentation if changed**

```bash
git add DEPLOYMENT.md
git commit -m "docs: record confirmed Neon deployment target"
```

---

### Task 5: Review the consolidation before merge

**Files:**
- Review all changes on `unified-render-neon`.
- Tooling: CodeRabbit, GitHub diff/status, repository build/typecheck.

**Interfaces:**
- Produces: review-clean PR ready to merge to `main`.

- [ ] **Step 1: Run repository checks**

Run:

```bash
pnpm typecheck
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/occu-med-hub build
pnpm --filter @workspace/api-server build
```

Expected: all commands exit 0.

- [ ] **Step 2: Inspect secret leakage**

Search built frontend source/output for these names:

```text
DATABASE_URL
LLAMA_CLOUD_API_KEY
OCRSPACE_API_KEY
OPTIIC_API_KEY
```

Expected: no secret values and no server-side environment data embedded in the browser bundle.

- [ ] **Step 3: Open a PR from `unified-render-neon` to `main`**

PR title:

```text
Unify Render deployment and enforce Neon production database
```

PR body must summarize same-origin routing, Neon-only production validation, one-service Render topology, and cutover safeguards.

- [ ] **Step 4: Run CodeRabbit review**

Request review of the PR focusing on:

```text
Express 5 wildcard routing
static/SPА fallback ordering
path resolution on Render
Neon URL validation
secret exposure
render.yaml correctness
```

- [ ] **Step 5: Fix confirmed review findings and rerun checks**

For each accepted finding, commit the fix separately when practical, then repeat Step 1.

- [ ] **Step 6: Merge only when checks and review are clean**

Merge the PR to `main` after successful verification.

---

### Task 6: Create and verify the new Render service

**Files:**
- No additional code expected unless live deployment reveals a real defect.
- Tooling: Render, Neon, browser/preview tooling, GitHub.

**Interfaces:**
- Produces: new live service `Network-Development-Hub` backed by the confirmed existing Neon database.

- [ ] **Step 1: Create the service in the confirmed Occu-Med workspace**

Configuration:

```text
Name: Network-Development-Hub
Repository: Occumed79/Provider-Intelligence-Hub
Branch: main
Runtime: Node
Plan: Free
Auto-deploy: enabled
```

Use the repository `render.yaml` values for build/start behavior.

- [ ] **Step 2: Set the confirmed existing Neon `DATABASE_URL`**

Use the exact existing Neon connection string from Task 4. Do not create a new Neon project unless separately approved.

- [ ] **Step 3: Set OCR secrets**

Configure the populated values for:

```text
LLAMA_CLOUD_API_KEY through LLAMA_CLOUD_API_KEY_5
OCRSPACE_API_KEY through OCRSPACE_API_KEY_5
OPTIIC_API_KEY through OPTIIC_API_KEY_4
```

Do not expose them as `VITE_*` variables.

- [ ] **Step 4: Deploy and inspect build/runtime logs**

Expected build log includes successful frontend and API builds.
Expected runtime log includes one server listening on Render `$PORT` and successful Drizzle schema synchronization against Neon.

- [ ] **Step 5: Verify HTTP behavior**

Check:

```text
GET /                         => 200 HTML
GET /network-development      => 200 HTML
GET /upload                   => 200 HTML
GET /api/health               => 200 JSON
GET /api/providers            => 200 JSON/database-backed
GET /api/not-a-real-route     => 404 JSON
```

- [ ] **Step 6: Verify representative data parity**

Compare providers, outreach, evidence, and review data between the new service and old live API. Expected: same database-backed counts/content for equivalent endpoints.

- [ ] **Step 7: Verify document intake**

Upload one safe/non-sensitive text-layer PDF and one safe scanned/image test document.

Expected:

```text
text-layer PDF => local extraction mode
scan/image => configured cloud cascade or local Tesseract fallback
record persisted to the confirmed Neon database
```

- [ ] **Step 8: Verify in browser/preview tool**

Open the new URL and confirm:

```text
sidebar renders
Network Development route renders
refreshing a client-side route does not 404
Upload Intake renders and can reach /api
no CORS errors
```

---

### Task 7: Retire the two old Render services only after cutover verification

**Files:**
- No repository code changes expected.
- Tooling: Render.

**Interfaces:**
- Consumes: successful Task 6 verification.
- Produces: only `Network-Development-Hub` remains for this application.

- [ ] **Step 1: Reconfirm replacement health immediately before deletion**

Verify:

```text
new service live
Neon data parity confirmed
frontend route refresh works
/api/health returns 200
OCR/upload smoke test passed
```

- [ ] **Step 2: Delete the old frontend service**

Target:

```text
Provider-Intelligence-Hub-1
```

- [ ] **Step 3: Recheck the new unified service**

Verify root, one client route, and `/api/health` again.

- [ ] **Step 4: Delete the old API service**

Target:

```text
Provider-Intelligence-Hub
```

- [ ] **Step 5: Final verification**

Verify the new service is the sole production Render service for this app and still reads/writes the confirmed Neon database.
