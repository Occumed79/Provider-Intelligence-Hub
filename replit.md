# Occu-Med Provider Intelligence Intake Hub

## Overview
A full-stack internal command-center for occupational medicine provider research and intelligence intake. Users manually upload screenshots, PDFs, Excel files, CSVs, Word docs, and notes — the hub preserves raw evidence, extracts structured provider data, and builds a searchable intelligence database.

## Architecture

### Monorepo Structure (pnpm workspaces)
```
artifacts/
  occu-med-hub/        React + Vite frontend (serves at /)
  api-server/          Express 5 + TypeScript backend (serves at /api)
  mockup-sandbox/      Canvas component preview server
lib/
  api-spec/            OpenAPI spec + Orval codegen config
  api-client-react/    Generated TanStack Query hooks
  api-zod/             Generated Zod validation schemas
  db/                  Drizzle ORM + PostgreSQL schema
```

### Frontend (artifacts/occu-med-hub)
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4 — macOS Tahoe / Liquid Glass design: dark space backgrounds, purple/magenta/blue glow accents, translucent glass cards
- **Routing**: Wouter
- **State/API**: TanStack Query with Orval-generated hooks from `@workspace/api-client-react`
- **UI Components**: Radix UI + shadcn-style components

**Pages:**
- `/` → Dashboard — Stats grid, recent uploads, operations log
- `/upload` → Upload Intake — Drag-and-drop zone + paste text; simulated extraction result display (labeled "SIMULATED EXTRACTION")
- `/evidence` → Evidence Library — Folder-tree browser by state/city/provider
- `/providers` → Provider Database — Searchable/filterable provider table
- `/providers/:id` → Provider Detail — Full profile with linked evidence
- `/search` → Smart Search — Full-text search across providers and evidence
- `/map` → Map Coverage — CSS hex-grid US map with provider density
- `/review` → Review Queue — Human-in-the-loop verification workflow
- `/settings` → Settings placeholder

### Backend (artifacts/api-server)
- **Framework**: Express 5 + TypeScript
- **Logging**: Pino structured JSON logging
- **File Upload**: Multer (stores to `artifacts/api-server/uploads/`)
- **Extraction**: Simulated extraction engine (clearly labeled) — generates mock clinic data from uploaded files
- **Database**: Drizzle ORM + PostgreSQL

**API Routes:**
- `GET /api/dashboard/stats` — Dashboard statistics
- `GET /api/dashboard/recent-uploads` — Recent evidence files
- `GET /api/dashboard/activity` — Activity feed
- `GET/POST /api/evidence` — Evidence file CRUD
- `GET /api/evidence/folder-tree` — Folder tree for Evidence Library
- `POST /api/upload` — Multipart file upload with simulated extraction
- `POST /api/upload/paste` — Pasted text upload with simulated extraction
- `GET/POST /api/providers` — Provider CRUD
- `GET/PATCH /api/providers/:id` — Provider detail/update
- `GET /api/providers/map` — Providers with GPS coords for map
- `GET /api/providers/states-coverage` — State-level coverage stats
- `GET/PATCH /api/review` — Review queue management
- `GET /api/review/counts` — Review counts by status
- `GET /api/search` — Full-text search (ILIKE across all relevant fields)

### Database Schema (lib/db)
- `evidence_files` — Raw uploaded file records with metadata, folder path, extraction status
- `providers` — Extracted provider records (clinic name, address, services, billing/TPA clues)
- `review_items` — Human review queue with priority levels and status
- `extracted_fields` — Individual extracted field values linked back to source evidence files

## Key Design Decisions
- **Simulated extraction**: All OCR/AI extraction is clearly labeled "SIMULATED EXTRACTION" — no fake internet crawling
- **Evidence-first**: Every extracted field links back to its raw source file
- **Folder organization**: Files are organized by state/city/provider/sourceType virtual folder path
- **Smart search**: Full-text ILIKE search across all provider and evidence fields

## Development
- Frontend runs at `localhost:23885/` (accessed via proxy at `/`)
- API server runs at `localhost:8080/` (accessed via proxy at `/api`)
- DB schema changes: `pnpm --filter @workspace/db run push`
- Codegen after spec changes: `pnpm --filter @workspace/api-spec run codegen`
