import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const outreachRecordsTable = pgTable("outreach_records", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id"),
  providerName: text("provider_name").notNull(),
  providerCity: text("provider_city"),
  providerState: text("provider_state"),
  providerEmail: text("provider_email"),
  providerFax: text("provider_fax"),
  outreachType: text("outreach_type").notNull().default("email"),
  templateName: text("template_name"),
  subject: text("subject"),
  body: text("body"),
  recipientEmail: text("recipient_email"),
  recipientFax: text("recipient_fax"),
  status: text("status").notNull().default("sent"),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  followUpDate: timestamp("follow_up_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOutreachRecordSchema = createInsertSchema(outreachRecordsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOutreachRecord = z.infer<typeof insertOutreachRecordSchema>;
export type OutreachRecord = typeof outreachRecordsTable.$inferSelect;
