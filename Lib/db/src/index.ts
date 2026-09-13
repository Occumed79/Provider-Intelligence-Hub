import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

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

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("Production DATABASE_URL must use the PostgreSQL protocol.");
  }

  if (!parsed.hostname.endsWith(".neon.tech")) {
    throw new Error(
      "Production DATABASE_URL must point to Neon PostgreSQL (*.neon.tech).",
    );
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set.");
}

validateProductionDatabaseUrl(databaseUrl);

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

export * from "./schema";
