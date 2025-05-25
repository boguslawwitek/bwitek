import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, timestamp, int, boolean } from "drizzle-orm/mysql-core";

export const uploads = mysqlTable("uploads", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimetype: varchar("mimetype", { length: 100 }).notNull(),
  size: int("size").notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  uploadedBy: varchar("uploaded_by", { length: 191 }),
  category: varchar("category", { length: 50 }).notNull().default("general"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
});

export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert; 