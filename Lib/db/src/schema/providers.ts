import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const providersTable = pgTable("providers", {
  id: serial("id").primaryKey(),
  clinicName: text("clinic_name").notNull(),
  clinicType: text("clinic_type"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  phone: text("phone"),
  fax: text("fax"),
  website: text("website"),
  email: text("email"),
  contactPerson: text("contact_person"),
  servicesOffered: text("services_offered"),
  pricingNotes: text("pricing_notes"),
  employerAccountClues: text("employer_account_clues"),
  corporateBillingClues: text("corporate_billing_clues"),
  netTermsClues: text("net_terms_clues"),
  acceptsOutsideForms: text("accepts_outside_forms"),
  tpaFriendlyClues: text("tpa_friendly_clues"),
  paymentRequirements: text("payment_requirements"),
  verificationStatus: text("verification_status").notNull().default("Needs Review"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  sourceCount: text("source_count").notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const providerNotesTable = pgTable("provider_notes", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providersTable.id),
  note: text("note").notNull(),
  createdBy: text("created_by").notNull().default("system"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const providerActivityTable = pgTable("provider_activity", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providersTable.id),
  activityType: text("activity_type").notNull(),
  title: text("title").notNull(),
  detail: text("detail"),
  createdBy: text("created_by").notNull().default("system"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProviderSchema = createInsertSchema(providersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProviderNoteSchema = createInsertSchema(providerNotesTable).omit({ id: true, createdAt: true });
export const insertProviderActivitySchema = createInsertSchema(providerActivityTable).omit({ id: true, createdAt: true });
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providersTable.$inferSelect;
export type ProviderNote = typeof providerNotesTable.$inferSelect;
export type ProviderActivity = typeof providerActivityTable.$inferSelect;
