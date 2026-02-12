CREATE TABLE `admin_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `analysis_history` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`ai_type` text NOT NULL,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`project_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `api_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`used_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`project_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `application_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `help` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ai_type` text NOT NULL,
	`text` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_info` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`business_type` text,
	`address` text,
	`nearest_station` text,
	`concept` text,
	`strength` text,
	`target_age` text,
	`targetGender` text,
	`target_area` text,
	`target_attribute` text,
	`target_concern` text,
	`existing_customer_analysis` text,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`project_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`manager_name` text NOT NULL,
	`owner_name` text NOT NULL,
	`project_id` text NOT NULL,
	`project_pass` text NOT NULL,
	`api_usage_limit` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `prompt` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ai_type` text NOT NULL,
	`system` text NOT NULL,
	`user` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`project_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_session_id_idx` ON `admin_session` (`id`);--> statement-breakpoint
CREATE INDEX `analysis_history_project_id_idx` ON `analysis_history` (`project_id`);--> statement-breakpoint
CREATE INDEX `api_usage_project_id_idx` ON `api_usage` (`project_id`);--> statement-breakpoint
CREATE INDEX `api_usage_used_at_idx` ON `api_usage` (`used_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `application_settings_key_unique` ON `application_settings` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `application_settings_key_idx` ON `application_settings` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `help_ai_type_unique` ON `help` (`ai_type`);--> statement-breakpoint
CREATE UNIQUE INDEX `help_ai_type_idx` ON `help` (`ai_type`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_info_project_id_idx` ON `project_info` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_project_id_unique` ON `project` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_project_id_idx` ON `project` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `prompt_ai_type_unique` ON `prompt` (`ai_type`);--> statement-breakpoint
CREATE INDEX `prompt_ai_type_idx` ON `prompt` (`ai_type`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_id_idx` ON `session` (`id`);