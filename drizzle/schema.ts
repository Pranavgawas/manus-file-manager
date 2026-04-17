import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Files table for storing user-uploaded file metadata.
 * File bytes are stored in S3; this table tracks references and metadata.
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  /** Original filename as uploaded by user */
  filename: varchar("filename", { length: 255 }).notNull(),
  /** Storage key returned by storagePut (reference to S3 object) */
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  /** MIME type of the file (e.g., image/jpeg, video/mp4, text/plain) */
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  /** File size in bytes */
  size: bigint("size", { mode: "number" }).notNull(),
  /** File type category for filtering: image, video, text, or other */
  fileType: mysqlEnum("fileType", ["image", "video", "text", "other"]).notNull(),
  /** Timestamp when file was uploaded */
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

// TODO: Add more tables here as your schema grows.