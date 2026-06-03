CREATE TABLE `instagram_account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`instagram_user_id` text NOT NULL,
	`instagram_username` text,
	`facebook_page_id` text NOT NULL,
	`access_token` text NOT NULL,
	`token_expires_at` integer,
	`connected_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`project_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instagram_account_project_id_unique` ON `instagram_account` (`project_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `instagram_account_project_id_idx` ON `instagram_account` (`project_id`);
