# Provider Intelligence Hub Deployment Notes

This app is a full-stack Render deployment. It should not be treated as one simple static website.

## Services

### 1. Frontend

Render service type: Static Site

Build command:

```bash
corepack enable && pnpm install --no-frozen-lockfile && pnpm --filter @workspace/occu-med-hub build
```

Publish directory:

```bash
artifacts/occu-med-hub/dist/public
```

Required environment variables:

```bash
NODE_VERSION=22
NODE_ENV=production
PORT=3000
BASE_PATH=/
VITE_API_BASE_URL=<backend Render URL>
```

Example:

```bash
VITE_API_BASE_URL=https://provider-intelligence-hub-api.onrender.com
```

The frontend Vite config requires PORT and BASE_PATH during build. The frontend API client uses VITE_API_BASE_URL to call the deployed backend instead of trying to call API routes from the static site domain.

### 2. Backend API

Render service type: Web Service

Build command:

```bash
corepack enable && pnpm install --no-frozen-lockfile && pnpm --filter @workspace/api-server build
```

Start command:

```bash
pnpm --filter @workspace/api-server start
```

Required environment variables:

```bash
NODE_VERSION=22
NODE_ENV=production
DATABASE_URL=<Render PostgreSQL external/internal URL>
FRONTEND_ORIGIN=<frontend Render URL>
```

Backend checks:

```bash
/api/healthz
/api/status
```

Use /api/status after deployment to confirm that the API is running and the database connection is healthy.

## Important notes

- This is a pnpm workspace. Do not use npm install for this repo.
- Root directory should stay blank on Render.
- The frontend and backend should be separate Render services.
- The UI theme is controlled globally in `artifacts/occu-med-hub/src/index.css`.
- The current visual target is macOS Tahoe inspired liquid glass with luminous blue/violet UI, bold headings, and premium dashboard styling.

## Next development priorities

1. Confirm backend database schema and migrations.
2. Confirm all API routes used by the frontend.
3. Harden upload/import flow for provider spreadsheets.
4. Improve provider table, provider profile, upload, and outreach pages using the same liquid-glass design language.
5. Add stronger empty states and frontend API-error messaging for deployment handoff.
