ALTER TABLE `analysis_history` ADD `revision_parent_id` text;--> statement-breakpoint
ALTER TABLE `analysis_history` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX `analysis_history_revision_parent_id_idx` ON `analysis_history` (`revision_parent_id`);
