import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const difficultyReportsTable = pgTable("difficulty_reports", {
  id: serial("id").primaryKey(),
  state: text("state").notNull(),
  city: text("city"),
  service: text("service"),
  requestedBy: text("requested_by"),
  department: text("department"),
  notes: text("notes"),
  score: integer("score").notNull(),
  tier: text("tier").notNull(),
  totalProviders: integer("total_providers").notNull(),
  verifiedProviders: integer("verified_providers").notNull(),
  flaggedProviders: integer("flagged_providers").notNull(),
  tpaProviders: integer("tpa_providers").notNull(),
  usableProviders: integer("usable_providers").notNull(),
  serviceMatch: integer("service_match"),
  factorsJson: jsonb("factors_json").notNull(),
  outreachJson: jsonb("outreach_json").notNull(),
  recommendationsJson: jsonb("recommendations_json").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDifficultyReportSchema = createInsertSchema(difficultyReportsTable).omit({
  id: true,
  generatedAt: true,
});

export type InsertDifficultyReport = z.infer<typeof insertDifficultyReportSchema>;
export type DifficultyReportRow = typeof difficultyReportsTable.$inferSelect;
