# Network Development Hub Deployment Notes

The application deploys as **one Render Node web service** backed by the existing **Neon PostgreSQL** database.

## Production topology

```text
GitHub: Occumed79/Provider-Intelligence-Hub
                 |
                 v
Render: Network-Development-Hub
  - React/Vite frontend
  - Express API under /api/*
  - OCR/document processing
                 |
                 v
Neon PostgreSQL (existing database only)
```

The React application and API use the same origin. Production does not require a separate frontend service or `VITE_API_BASE_URL`.

## Render service

- **Name:** `Network-Development-Hub`
- **Type:** Web Service
- **Runtime:** Node
- **Repository:** `https://github.com/Occumed79/Provider-Intelligence-Hub`
- **Branch:** `main`
- **Root directory:** blank / repository root
- **Plan:** free unless deliberately changed

Build command:

```bash
corepack enable && pnpm install --no-frozen-lockfile --ignore-scripts=false && pnpm rebuild esbuild && PORT=3000 BASE_PATH=/ pnpm --filter @workspace/occu-med-hub build && pnpm --filter @workspace/api-server build
```

Start command:

```bash
pnpm --filter @workspace/db push && pnpm --filter @workspace/api-server start
```

Render supplies the runtime `PORT`. `PORT=3000` in the build command is only for Vite configuration while compiling the frontend.

## Production environment variables

Required:

```text
NODE_VERSION=22
NODE_ENV=production
BASE_PATH=/
DATABASE_URL=<existing Neon PostgreSQL connection string>
```

OCR credentials remain server-side only:

```text
LLAMA_CLOUD_API_KEY
LLAMA_CLOUD_API_KEY_2
LLAMA_CLOUD_API_KEY_3
LLAMA_CLOUD_API_KEY_4
LLAMA_CLOUD_API_KEY_5

OCRSPACE_API_KEY
OCRSPACE_API_KEY_2
OCRSPACE_API_KEY_3
OCRSPACE_API_KEY_4
OCRSPACE_API_KEY_5

OPTIIC_API_KEY
OPTIIC_API_KEY_2
OPTIIC_API_KEY_3
OPTIIC_API_KEY_4
```

Do not expose database or OCR credentials through `VITE_*` variables.

## Neon-only database rule

Production startup validates that `DATABASE_URL` points to a host ending in `.neon.tech`. The application continues to use Drizzle ORM with `pg.Pool`; the guard prevents an accidental production switch to Render Postgres, Supabase, local PostgreSQL, or another PostgreSQL provider.

The replacement service must reuse the **same existing Neon database currently used by `Provider-Intelligence-Hub`**. Do not create a fresh Neon project simply to complete the Render consolidation.

The connected Neon account was inspected on 2026-09-13. None of the visible projects matched the application's complete schema signature (`providers`, `evidence_files`, `extracted_fields`, `review_items`, `outreach_records`, `provider_invites`, `secure_messages`, `app_settings`, `audit_events`, `difficulty_reports`, `currency_fee_schedules`). Therefore the existing `DATABASE_URL` from the current Render API service remains the authoritative connection until the backing Neon project can be positively identified. Do not guess a project based on a partial table-name match.

## Runtime routing

```text
/                         -> React application
/network-development      -> React application
/upload                   -> React application
/outreach                 -> React application
/api/*                    -> Express API
/api/health               -> API health JSON
```

Unknown `/api/*` routes return JSON 404 responses. Browser GET/HEAD routes fall back to the React `index.html` so client-side routes work on refresh.

## Cutover procedure

The existing services remain in place until the replacement is proven healthy:

- `Provider-Intelligence-Hub` — current API
- `Provider-Intelligence-Hub-1` — current frontend

Cutover order:

1. Merge the unified-service repository changes to `main` after build/type review.
2. Create `Network-Development-Hub` in the Occu-Med Render workspace.
3. Copy the existing API service's Neon `DATABASE_URL` into the new service.
4. Copy the required OCR credentials into the new service.
5. Deploy the new service.
6. Verify `/`, `/network-development`, `/upload`, `/api/health`, and database-backed API endpoints.
7. Compare representative provider/outreach/evidence/review data with the old deployment.
8. Smoke-test automatic document intake using safe non-sensitive test documents.
9. Delete `Provider-Intelligence-Hub-1` only after the new service passes verification.
10. Re-verify the unified service.
11. Delete `Provider-Intelligence-Hub` only after the second verification.

## Important notes

- This is a pnpm workspace. Do not use `npm install` for deployment.
- The current UI and visual language are preserved; consolidation is deployment architecture work, not a redesign.
- The frontend build output is `artifacts/occu-med-hub/dist/public`.
- The Express server validates that this frontend build exists before serving traffic.
- Local/split development can still set `VITE_API_BASE_URL`; unified production leaves it unset so `/api/*` stays same-origin.
- Never delete the old services before the replacement is live and data parity is confirmed.
