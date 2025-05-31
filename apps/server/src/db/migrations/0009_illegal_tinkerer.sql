CREATE TABLE `pending_newsletter_subscriptions` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`language` enum('pl','en') NOT NULL,
	`source` varchar(50) DEFAULT 'website',
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `pending_newsletter_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `pending_newsletter_subscriptions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `unsubscribe_feedback` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`reason` enum('too_frequent','not_relevant','never_subscribed','poor_content','technical_issues','other') NOT NULL,
	`feedback` text,
	`language` enum('pl','en') NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `unsubscribe_feedback_id` PRIMARY KEY(`id`)
);
