CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL,
	`image` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact` (
	`id` varchar(36) NOT NULL,
	`order` int NOT NULL,
	`name` json NOT NULL,
	`url` text,
	`external` boolean NOT NULL DEFAULT false,
	`new_tab` boolean NOT NULL DEFAULT false,
	CONSTRAINT `contact_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homepage` (
	`id` varchar(36) NOT NULL,
	`welcome_text` json NOT NULL,
	`specialization_text` json NOT NULL,
	`about_me_text` json NOT NULL,
	CONSTRAINT `homepage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `navigation` (
	`id` varchar(36) NOT NULL,
	`label` json NOT NULL,
	`order` int NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`url` text,
	`external` boolean NOT NULL DEFAULT false,
	`new_tab` boolean NOT NULL DEFAULT false,
	CONSTRAINT `navigation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`title` json NOT NULL,
	`description` json NOT NULL,
	`url` text,
	`repo_url` text,
	`image_url` text,
	`order` int NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` varchar(36) NOT NULL,
	`name` json NOT NULL,
	`category` json NOT NULL,
	`icon_name` varchar(50),
	`icon_provider` varchar(50),
	`order` int NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `top_bar` (
	`id` varchar(36) NOT NULL,
	`order` int NOT NULL,
	`name` json NOT NULL,
	`icon_name` varchar(50),
	`icon_provider` varchar(50),
	`url` text,
	`external` boolean NOT NULL DEFAULT false,
	`new_tab` boolean NOT NULL DEFAULT false,
	CONSTRAINT `top_bar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;