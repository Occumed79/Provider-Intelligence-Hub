# Network Development Hub Deployment Notes

The application deploys as **one Render Node web service** backed by a dedicated **Neon PostgreSQL** database.

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
Dedicated Neon PostgreSQL database
```

The React application and API use the same origin. Production does not require a separate frontend service or `VITE_API_BASE_URL`.

## Render service

- **Name:** `Network-Development-Hub`
- **Type:** Web Service
- **Runtime:** Node
- **Repository:** `https://github.com/Occumed79/Provider-Intelligence-Hub`
- **Branch:** `main` after the consolidation PR is merged
- **Root directory:** repository root / blank
- **Plan:** free unless deliberately changed

Build command:

```bash
corepack enable && pnpm install --no-frozen-lockfile --ignore-scripts=false && pnpm rebuild esbuild && PORT=3000 BASE_PATH=/ pnpm --filter @workspace/occu-med-hub build && pnpm --filter @workspace/api-server build
```

Start command:

```bash
pnpm --filter @workspace/db push && pnpm --filter @workspace/api-server start
```

The `db push` step initializes/synchronizes the new Neon database from the repository's Drizzle schema before the app starts.

Render supplies the runtime `PORT`. `PORT=3000` in the build command is only for Vite configuration while compiling the frontend.

## Production environment variables

Required:

```text
NODE_VERSION=22
NODE_ENV=production
BASE_PATH=/
DATABASE_URL=<dedicated Neon PostgreSQL connection string supplied out-of-band>
```

The actual connection string is a secret and must exist only in Render environment variables. Never commit it to GitHub or expose it through Vite.

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

### Fresh-database cutover decision — 2026-09-13

The unified `Network-Development-Hub` will use the **new dedicated Neon database supplied for this deployment**.

The previous Provider Intelligence Hub Neon database is explicitly out of scope:

- do not identify or match it;
- do not copy data from it;
- do not migrate it;
- do not run schema changes against it;
- do not change the old services' database connection while they remain online.

This removes database-parity/migration work from the consolidation. The new database begins from the current repository schema and is initialized by `pnpm --filter @workspace/db push`.

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

The existing Render services remain online while the replacement is built and verified:

- `Provider-Intelligence-Hub` — current API
- `Provider-Intelligence-Hub-1` — current frontend

Cutover order:

1. Merge the unified-service repository changes to `main` after build/review checks.
2. Free one Render Hobby service slot in the Occu-Med workspace; the workspace is currently at its 25-service limit.
3. Create `Network-Development-Hub` in the Occu-Med Render workspace.
4. Add the new dedicated Neon `DATABASE_URL` to the new service only.
5. Add the required OCR credentials to the new service.
6. Deploy; startup initializes the new database schema and launches the unified server.
7. Verify `/`, `/network-development`, `/upload`, `/api/health`, and database-backed API endpoints.
8. Verify the new database contains the expected app tables after startup.
9. Smoke-test automatic document intake using safe non-sensitive test documents and confirm records persist in the new Neon database.
10. Verify client-side route refresh and same-origin `/api/*` calls in a browser.
11. Retire the two old Provider Intelligence Render services only after the replacement passes verification.

No data-parity comparison with the old database is required because this is an intentional fresh-database cutover.

## Important notes

- This is a pnpm workspace. Do not use `npm install` for deployment.
- The current UI and visual language are preserved; consolidation is deployment architecture work, not a redesign.
- The frontend build output is `artifacts/occu-med-hub/dist/public`.
- The Express server validates that this frontend build exists before serving traffic.
- Unified production leaves `VITE_API_BASE_URL` unset so `/api/*` stays same-origin.
- Never place the Neon connection string or OCR key values in repository files, GitHub Actions logs, frontend code, or `VITE_*` variables.
