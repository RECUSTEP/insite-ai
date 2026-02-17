-- Add seo_addon_enabled column to project table
ALTER TABLE `project` ADD `seo_addon_enabled` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Add project_id back to session table (nullable, references project)
-- SQLite limitation: Cannot add foreign key constraint directly, will be added via table recreation if needed
ALTER TABLE `session` ADD `project_id` text;