# Fresh Neon Cutover Addendum

Date: 2026-09-13

This addendum supersedes the database-reuse sections of `2026-09-13-unified-render-neon-design.md`.

## Decision

The unified `Network-Development-Hub` will use a new dedicated Neon PostgreSQL database supplied by the user for this deployment.

The previous Provider Intelligence Hub database must remain untouched. Do not identify, inspect, migrate, copy, alter, or repoint the old deployment to that database.

## Deployment behavior

- The new Render service receives the new Neon connection string only as the server-side `DATABASE_URL` secret.
- The connection string is never committed to GitHub and is never exposed as a `VITE_*` value.
- `pnpm --filter @workspace/db push` initializes/synchronizes the new database from the current Drizzle schema on service startup.
- No old-database data migration or parity requirement applies to this cutover.
- Verification focuses on expected schema creation, API reads/writes, upload persistence, OCR intake, same-origin routing, and browser behavior on the new database.

## Old deployment

The existing Render frontend/API services remain online until the replacement service passes verification. Their database settings are not changed during this work.

## Render capacity blocker

The Occu-Med Hobby workspace is currently at Render's 25-service limit. A slot must be freed before `Network-Development-Hub` can be created in that workspace.
