import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewItemsTable = pgTable("review_items", {
  id: serial("id").primaryKey(),
  reviewStatus: text("review_status").notNull().default("pending"),
  priority: text("priority").notNull().default("normal"),
  issueType: text("issue_type").notNull(),
  description: text("description").notNull(),
  providerId: integer("provider_id"),
  evidenceFileId: integer("evidence_file_id"),
  providerName: text("provider_name"),
  assignedTo: text("assigned_to"),
  notes: text("notes"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReviewItemSchema = createInsertSchema(reviewItemsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReviewItem = z.infer<typeof insertReviewItemSchema>;
export type ReviewItem = typeof reviewItemsTable.$inferSelect;
