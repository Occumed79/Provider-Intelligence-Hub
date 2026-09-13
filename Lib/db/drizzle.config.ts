import { defineConfig } from "drizzle-kit";
import path from "path";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running Drizzle.");
}

if (process.env.NODE_ENV === "production") {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
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

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
