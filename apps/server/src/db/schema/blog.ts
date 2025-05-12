import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  json,
  timestamp,
  datetime,
} from "drizzle-orm/mysql-core";
import { type Translation } from './content';

export const blogCategories = mysqlTable("blog_categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: json("name").$type<Translation>().notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: json("description").$type<Translation>(),
  iconName: varchar("icon_name", { length: 50 }),
  iconProvider: varchar("icon_provider", { length: 50 }),
  order: int("order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const blogPosts = mysqlTable("blog_posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  categoryId: varchar("category_id", { length: 36 }).references(() => blogCategories.id, { onDelete: 'set null' }),
  title: json("title").$type<Translation>().notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: json("content").$type<Translation>().notNull(),
  excerpt: json("excerpt").$type<Translation>(),
  metaTitle: json("meta_title").$type<Translation>(),
  metaDescription: json("meta_description").$type<Translation>(),
  metaKeywords: json("meta_keywords").$type<Translation>(),
  ogImage: text("og_image"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: datetime("published_at"),
  isFeatured: boolean("is_featured").notNull().default(false),
  viewCount: int("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const blogAttachments = mysqlTable("blog_attachments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  postId: varchar("post_id", { length: 36 }).references(() => blogPosts.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  url: text("url").notNull(),
  size: int("size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});