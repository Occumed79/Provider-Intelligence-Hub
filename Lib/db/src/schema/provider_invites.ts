import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const providerInvitesTable = pgTable("provider_invites", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  providerId: integer("provider_id"),
  providerName: text("provider_name").notNull(),
  providerEmail: text("provider_email"),
  providerOrg: text("provider_org"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  invitedAt: timestamp("invited_at", { withTimezone: true }).defaultNow(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProviderInviteSchema = createInsertSchema(providerInvitesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProviderInvite = z.infer<typeof insertProviderInviteSchema>;
export type ProviderInvite = typeof providerInvitesTable.$inferSelect;
