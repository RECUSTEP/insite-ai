CREATE TABLE `auth` (
	`id` text PRIMARY KEY NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `project` ADD `auth_id` text REFERENCES auth(id);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/