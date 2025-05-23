CREATE TABLE `blog_page_meta` (
	`id` varchar(36) NOT NULL,
	`meta_title` json,
	`meta_description` json,
	`meta_keywords` json,
	`og_image` text,
	CONSTRAINT `blog_page_meta_id` PRIMARY KEY(`id`)
);
