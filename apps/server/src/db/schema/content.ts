import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  json,
  timestamp,
} from "drizzle-orm/mysql-core";

export type Translation = {
  pl: string;
  en: string;
};

export const navigation = mysqlTable("navigation", {
  id: varchar("id", { length: 36 }).primaryKey(),
  label: json("label").$type<Translation>().notNull(),
  order: int("order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  url: text("url"),
  external: boolean("external").notNull().default(false),
  newTab: boolean("new_tab").notNull().default(false),
});

export const homepage = mysqlTable("homepage", {
  id: varchar("id", { length: 36 }).primaryKey(),
  welcomeText: json("welcome_text").$type<Translation>().notNull(),
  specializationText: json("specialization_text").$type<Translation>().notNull(),
  aboutMeText: json("about_me_text").$type<Translation>().notNull(),
  metaTitle: json("meta_title").$type<Translation>(),
  metaDescription: json("meta_description").$type<Translation>(),
  metaKeywords: json("meta_keywords").$type<Translation>(),
  ogImage: text("og_image"),
});

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: json("title").$type<Translation>().notNull(),
  description: json("description").$type<Translation>().notNull(),
  url: text("url"),
  repoUrl: text("repo_url"),
  repoUrl2: text("repo_url2"),
  imageUrl: text("image_url"),
  order: int("order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const skillCategories = mysqlTable("skill_categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: json("name").$type<Translation>().notNull(),
  order: int("order").notNull(),
});

export const skills = mysqlTable("skills", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: json("name").$type<Translation>().notNull(),
  categoryId: varchar("category_id", { length: 36 }).references(() => skillCategories.id, { onDelete: 'set null' }),
  iconName: varchar("icon_name", { length: 50 }),
  iconProvider: varchar("icon_provider", { length: 50 }),
  order: int("order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const topBar = mysqlTable("top_bar", {
  id: varchar("id", { length: 36 }).primaryKey(),
  order: int("order").notNull(),
  name: json("name").$type<Translation>().notNull(),
  iconName: varchar("icon_name", { length: 50 }),
  iconProvider: varchar("icon_provider", { length: 50 }),
  url: text("url"),
  external: boolean("external").notNull().default(false),
  newTab: boolean("new_tab").notNull().default(false),
});

export const contact = mysqlTable("contact", {
  id: varchar("id", { length: 36 }).primaryKey(),
  order: int("order").notNull(),
  name: json("name").$type<Translation>().notNull(),
  iconName: varchar("icon_name", { length: 50 }),
  iconProvider: varchar("icon_provider", { length: 50 }),
  url: text("url"),
  external: boolean("external").notNull().default(false),
  newTab: boolean("new_tab").notNull().default(false),
});

export const projectsPageMeta = mysqlTable("projects_page_meta", {
  id: varchar("id", { length: 36 }).primaryKey(),
  metaTitle: json("meta_title").$type<Translation>(),
  metaDescription: json("meta_description").$type<Translation>(),
  metaKeywords: json("meta_keywords").$type<Translation>(),
  ogImage: text("og_image"),
});

export const skillsPageMeta = mysqlTable("skills_page_meta", {
  id: varchar("id", { length: 36 }).primaryKey(),
  metaTitle: json("meta_title").$type<Translation>(),
  metaDescription: json("meta_description").$type<Translation>(),
  metaKeywords: json("meta_keywords").$type<Translation>(),
  ogImage: text("og_image"),
});

export const contactPageMeta = mysqlTable("contact_page_meta", {
  id: varchar("id", { length: 36 }).primaryKey(),
  metaTitle: json("meta_title").$type<Translation>(),
  metaDescription: json("meta_description").$type<Translation>(),
  metaKeywords: json("meta_keywords").$type<Translation>(),
  ogImage: text("og_image"),
});

export const blogPageMeta = mysqlTable("blog_page_meta", {
  id: varchar("id", { length: 36 }).primaryKey(),
  metaTitle: json("meta_title").$type<Translation>(),
  metaDescription: json("meta_description").$type<Translation>(),
  metaKeywords: json("meta_keywords").$type<Translation>(),
  ogImage: text("og_image"),
});
