import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const currencyFeeSchedulesTable = pgTable("currency_fee_schedules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  currency: text("currency").notNull(),
  usdRate: text("usd_rate").notNull(),
  rowsJson: text("rows_json").notNull(),
  notes: text("notes"),
  createdBy: text("created_by").notNull().default("current-user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCurrencyFeeScheduleSchema = createInsertSchema(currencyFeeSchedulesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCurrencyFeeSchedule = z.infer<typeof insertCurrencyFeeScheduleSchema>;
export type CurrencyFeeSchedule = typeof currencyFeeSchedulesTable.$inferSelect;
