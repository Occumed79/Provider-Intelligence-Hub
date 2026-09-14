import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const PROCUREMENT_STAGES = [
  "Need Identified",
  "Prospecting",
  "In Contact",
  "Evaluating",
  "Pricing Secured",
  "Agreement Pending",
  "Final Review",
  "Activated / Live",
  "Lost / Not Viable",
] as const;

export type ProcurementStage = (typeof PROCUREMENT_STAGES)[number];

export const procurementRecordsTable = pgTable("procurement_records", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id"),
  providerName: text("provider_name").notNull(),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  serviceCategory: text("service_category"),
  stage: text("stage").notNull().default("Need Identified"),
  owner: text("owner"),
  waitingOn: text("waiting_on"),
  lastTouchAt: timestamp("last_touch_at", { withTimezone: true }),
  nextAction: text("next_action"),
  followUpDate: timestamp("follow_up_date", { withTimezone: true }),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  lostAt: timestamp("lost_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProcurementRecordSchema = createInsertSchema(procurementRecordsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProcurementRecord = z.infer<typeof insertProcurementRecordSchema>;
export type ProcurementRecord = typeof procurementRecordsTable.$inferSelect;
