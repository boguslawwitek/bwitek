CREATE TABLE `uploads` (
	`id` varchar(191) NOT NULL,
	`filename` varchar(255) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`mimetype` varchar(100) NOT NULL,
	`size` int NOT NULL,
	`path` varchar(500) NOT NULL,
	`url` varchar(500) NOT NULL,
	`uploaded_by` varchar(191),
	`category` varchar(50) NOT NULL DEFAULT 'general',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uploads_id` PRIMARY KEY(`id`)
);
