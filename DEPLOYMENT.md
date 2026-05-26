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
```

The frontend Vite config requires PORT and BASE_PATH during build.

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

## Important notes

- This is a pnpm workspace. Do not use npm install for this repo.
- Root directory should stay blank on Render.
- The frontend and backend should be separate Render services.
- The UI theme is controlled globally in `artifacts/occu-med-hub/src/index.css`.
- The current visual target is macOS Tahoe inspired liquid glass with luminous blue/violet UI, bold headings, and premium dashboard styling.

## Next development priorities

1. Confirm backend database schema and migrations.
2. Confirm all API routes used by the frontend.
3. Connect frontend API client to the deployed backend URL.
4. Harden upload/import flow for provider spreadsheets.
5. Improve provider table, provider profile, upload, and outreach pages using the same liquid-glass design language.
