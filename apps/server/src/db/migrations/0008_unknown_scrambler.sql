CREATE TABLE `privacy_policy` (
	`id` varchar(36) NOT NULL,
	`content` json NOT NULL,
	`last_updated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `privacy_policy_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `privacy_policy_page_meta` (
	`id` varchar(36) NOT NULL,
	`meta_title` json,
	`meta_description` json,
	`meta_keywords` json,
	`og_image` text,
	CONSTRAINT `privacy_policy_page_meta_id` PRIMARY KEY(`id`)
);
