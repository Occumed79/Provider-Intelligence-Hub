import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const evidenceFilesTable = pgTable("evidence_files", {
  id: serial("id").primaryKey(),
  originalFilename: text("original_filename").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  storagePath: text("storage_path"),
  uploadedBy: text("uploaded_by"),
  sourceUrl: text("source_url"),
  associatedProvider: text("associated_provider"),
  associatedCity: text("associated_city"),
  associatedState: text("associated_state"),
  sourceType: text("source_type"),
  category: text("category"),
  extractedText: text("extracted_text"),
  processingStatus: text("processing_status").notNull().default("Uploaded"),
  notes: text("notes"),
  providerId: integer("provider_id"),
  folderPath: text("folder_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEvidenceFileSchema = createInsertSchema(evidenceFilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEvidenceFile = z.infer<typeof insertEvidenceFileSchema>;
export type EvidenceFile = typeof evidenceFilesTable.$inferSelect;
