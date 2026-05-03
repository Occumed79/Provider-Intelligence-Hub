import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const secureMessagesTable = pgTable("secure_messages", {
  id: serial("id").primaryKey(),
  inviteToken: text("invite_token").notNull(),
  senderType: text("sender_type").notNull(),
  senderName: text("sender_name"),
  messageText: text("message_text"),
  isFile: boolean("is_file").notNull().default(false),
  fileName: text("file_name"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  readByHub: boolean("read_by_hub").notNull().default(false),
  readByProvider: boolean("read_by_provider").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSecureMessageSchema = createInsertSchema(secureMessagesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSecureMessage = z.infer<typeof insertSecureMessageSchema>;
export type SecureMessage = typeof secureMessagesTable.$inferSelect;
