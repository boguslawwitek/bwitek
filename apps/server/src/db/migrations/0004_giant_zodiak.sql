CREATE TABLE `contact_page_meta` (
	`id` varchar(36) NOT NULL,
	`meta_title` json,
	`meta_description` json,
	`meta_keywords` json,
	`og_image` text,
	CONSTRAINT `contact_page_meta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects_page_meta` (
	`id` varchar(36) NOT NULL,
	`meta_title` json,
	`meta_description` json,
	`meta_keywords` json,
	`og_image` text,
	CONSTRAINT `projects_page_meta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills_page_meta` (
	`id` varchar(36) NOT NULL,
	`meta_title` json,
	`meta_description` json,
	`meta_keywords` json,
	`og_image` text,
	CONSTRAINT `skills_page_meta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `homepage` ADD `meta_title` json;--> statement-breakpoint
ALTER TABLE `homepage` ADD `meta_description` json;--> statement-breakpoint
ALTER TABLE `homepage` ADD `meta_keywords` json;--> statement-breakpoint
ALTER TABLE `homepage` ADD `og_image` text;