# Unified Render + Neon Deployment Design

Date: 2026-09-13
Repository: `Occumed79/Provider-Intelligence-Hub`
Target branch: `unified-render-neon`

## Goal

Replace the current two-Render-service deployment with one Render Node web service that serves both the React/Vite frontend and the Express API. Preserve all application behavior, keep secrets server-side, and make Neon PostgreSQL the only supported database.

## Current State

The repository is a monorepo with:

- `artifacts/occu-med-hub` — React/Vite frontend
- `artifacts/api-server` — Express backend
- `Lib/db` — Drizzle + PostgreSQL schema/client

Render currently has two services for the same GitHub repository:

- `Provider-Intelligence-Hub-1` — frontend service
- `Provider-Intelligence-Hub` — API service

The API service currently runs the database schema push and then the Express server. The frontend currently supports a configurable `VITE_API_BASE_URL`, but when no base URL is set it already uses relative `/api/...` requests.

The database layer currently accepts any PostgreSQL `DATABASE_URL`. It is not explicitly Neon-only even though the intended database provider is Neon.

## Target Architecture

```text
GitHub: Occumed79/Provider-Intelligence-Hub
                    |
                    v
        Render: Network-Development-Hub
        one Node web service
          |                  |
          |                  +--> Express `/api/*`
          |
          +--> React/Vite static build + SPA fallback
                    |
                    v
             Neon PostgreSQL
```

There will be no separate frontend Render service after cutover.

## Runtime Routing

The unified Express application will route requests in this order:

1. API health and API routes under `/api/*`.
2. Static files from the built frontend directory.
3. SPA fallback to `index.html` for non-API browser routes such as `/network-development`, `/upload`, and `/outreach`.
4. API 404 responses remain JSON for unmatched `/api/*` routes.

The root URL `/` will serve the web application, not the API metadata JSON response.

## Build and Start

The single Render service will build both packages in one build:

```bash
corepack enable && \
pnpm install --no-frozen-lockfile --ignore-scripts=false && \
pnpm rebuild esbuild && \
pnpm --filter @workspace/occu-med-hub build && \
pnpm --filter @workspace/api-server build
```

The start command will continue to synchronize the Drizzle schema before starting the API:

```bash
pnpm --filter @workspace/db push && pnpm --filter @workspace/api-server start
```

The existing behavior is preserved initially to avoid introducing a second migration change during deployment consolidation.

## Frontend/API Communication

Production will use same-origin relative API requests:

```text
/api/providers
/api/upload
/api/outreach
/api/evidence
...
```

`VITE_API_BASE_URL` will not be required for the unified production service. The existing frontend client already leaves relative URLs untouched when the variable is absent.

This eliminates cross-service CORS coordination and prevents frontend/backend version drift.

## Neon-Only Database Rule

Neon PostgreSQL is the only supported production database.

The database startup code will:

1. require `DATABASE_URL`;
2. parse the URL safely;
3. reject production startup if the hostname does not end in `.neon.tech`;
4. continue using `pg.Pool` + Drizzle with the Neon PostgreSQL connection string.

This guard applies only to production so local development can still use a local PostgreSQL instance if needed.

No SQLite, Render Postgres, Supabase, or other database will be provisioned for this application.

## Existing Neon Data Preservation

The current live database must be reused rather than silently creating an empty replacement.

Before creating the new Render service, identify the Neon project currently backing the live API by matching the live schema signature (`providers`, `evidence_files`, `extracted_fields`, `review_items`, `outreach_records`, `provider_invites`, `secure_messages`, `app_settings`, `audit_events`, `difficulty_reports`, `currency_fee_schedules`) and, where necessary, row counts against the live service.

If the correct existing Neon project cannot be proven from connected tools, the old API service must remain untouched until its existing Neon connection string is confirmed. Do not guess a Neon project and do not use the previously inspected `Network Command Center` project merely because it contains a `providers` table.

## Secrets

The unified Render service owns server-side secrets only:

- `DATABASE_URL`
- `LLAMA_CLOUD_API_KEY`
- `LLAMA_CLOUD_API_KEY_2`
- `LLAMA_CLOUD_API_KEY_3`
- `LLAMA_CLOUD_API_KEY_4`
- `LLAMA_CLOUD_API_KEY_5`
- `OCRSPACE_API_KEY`
- `OCRSPACE_API_KEY_2`
- `OCRSPACE_API_KEY_3`
- `OCRSPACE_API_KEY_4`
- `OCRSPACE_API_KEY_5`
- `OPTIIC_API_KEY`
- `OPTIIC_API_KEY_2`
- `OPTIIC_API_KEY_3`
- `OPTIIC_API_KEY_4`

These keys must never be exposed through Vite environment variables or committed to GitHub.

## Render Service

Create one new service in the confirmed `Occu-Med` workspace:

- Name: `Network-Development-Hub`
- Runtime: Node
- Repository: `https://github.com/Occumed79/Provider-Intelligence-Hub`
- Branch: `main` after the consolidation changes are merged
- Plan: free unless the user changes it
- Region: Oregon to match the existing services unless changed deliberately
- Auto deploy: enabled

Do not delete either old service during initial creation.

## Cutover Sequence

1. Implement and review repo changes on `unified-render-neon`.
2. Build/test the combined frontend and API.
3. Confirm the correct existing Neon project and connection string.
4. Create the new `Network-Development-Hub` Render service.
5. Add only the required server-side environment variables.
6. Deploy and verify health, SPA routing, API routing, database reads, uploads, and OCR fallback behavior.
7. Verify the new service against the old service for representative provider/outreach/evidence counts.
8. Only after successful verification, retire/delete the two old Render services:
   - `Provider-Intelligence-Hub`
   - `Provider-Intelligence-Hub-1`

Deletion is deliberately last and requires successful validation of the replacement service.

## Error Handling

- `/api/*` errors remain JSON.
- Browser routes receive the SPA instead of the API 404 handler.
- Missing frontend build output should fail clearly at startup/build rather than silently serving an incomplete app.
- Invalid/non-Neon `DATABASE_URL` should fail fast in production with a clear configuration error.
- OCR provider failures continue to fall through the existing cloud/local extraction cascade.

## Verification

### Repository/build verification

- Type/build the frontend.
- Type/build the API.
- Confirm the API bundle can resolve the frontend build path.
- Verify no client bundle contains OCR/database secret names or values.

### Runtime verification

- `GET /` returns the React application.
- `GET /network-development` returns the React application.
- `GET /api/health` returns 200 JSON.
- `GET /api/providers` returns database-backed data.
- provider/outreach/evidence counts match the old API before cutover.
- upload with a text-layer PDF uses local extraction.
- scanned PDF/image exercises the configured OCR cascade.
- refresh on a client-side route works.

### Deployment verification

- Render build succeeds.
- Render logs show one server listening on `$PORT`.
- Neon connection succeeds.
- No second frontend/API Render service is required for the new URL.

## Tooling / Review Strategy

Use the connected toolbox where it materially improves confidence:

- GitHub — branch, code changes, PR, merge, commit status.
- Render — service creation, environment configuration, deploys, logs, runtime metrics.
- Neon — identify the existing database, validate schema/data, obtain the correct connection string if authorized.
- Context7 — confirm current Express/Vite/static-serving and dependency APIs when implementation details are uncertain.
- CodeRabbit — code review before merge.
- Browser/preview tooling — verify the unified live web experience after deployment.

## Non-Goals

- No redesign of the existing UI.
- No database migration to a different provider.
- No new database project unless preserving the existing database proves impossible and the user explicitly approves a migration.
- No deletion of the old Render services before the replacement is verified.
- No automatic same-provider key rotation to bypass free-tier quotas.
