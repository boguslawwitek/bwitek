import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const pendingNewsletterSubscriptions = mysqlTable("pending_newsletter_subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  language: mysqlEnum("language", ["pl", "en"]).notNull(),
  source: varchar("source", { length: 50 }).default("website"),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const unsubscribeFeedback = mysqlTable("unsubscribe_feedback", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  reason: mysqlEnum("reason", [
    "too_frequent",
    "not_relevant", 
    "never_subscribed",
    "poor_content",
    "technical_issues",
    "other"
  ]).notNull(),
  feedback: text("feedback"),
  language: mysqlEnum("language", ["pl", "en"]).notNull(),
  createdAt: timestamp("created_at").notNull(),
}); 