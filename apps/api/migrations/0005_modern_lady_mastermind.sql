/*
 SQLite does not support "Set not null to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE `analysis_history` ADD `revision_parent_id` text;--> statement-breakpoint
ALTER TABLE `analysis_history` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `project` ADD `seo_addon_enabled` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ADD `project_id` text REFERENCES project(project_id);--> statement-breakpoint
CREATE INDEX `analysis_history_revision_parent_id_idx` ON `analysis_history` (`revision_parent_id`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/