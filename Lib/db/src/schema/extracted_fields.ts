import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const extractedFieldsTable = pgTable("extracted_fields", {
  id: serial("id").primaryKey(),
  fieldName: text("field_name").notNull(),
  fieldValue: text("field_value").notNull(),
  confidenceLevel: text("confidence_level"),
  sourceSnippet: text("source_snippet"),
  evidenceFileId: integer("evidence_file_id").notNull(),
  providerId: integer("provider_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExtractedFieldSchema = createInsertSchema(extractedFieldsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertExtractedField = z.infer<typeof insertExtractedFieldSchema>;
export type ExtractedField = typeof extractedFieldsTable.$inferSelect;
