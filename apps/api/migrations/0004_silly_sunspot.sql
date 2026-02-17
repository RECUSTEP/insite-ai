-- SQLite does not support dropping columns with foreign keys directly
-- We need to recreate the table without the project_id column
--> statement-breakpoint
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `session_new` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`auth_id`) REFERENCES `auth`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `session_new` (`id`, `auth_id`, `expires_at`)
SELECT `id`, `auth_id`, `expires_at` FROM `session`;
--> statement-breakpoint
DROP TABLE `session`;
--> statement-breakpoint
ALTER TABLE `session_new` RENAME TO `session`;
--> statement-breakpoint
CREATE UNIQUE INDEX `session_id_idx` ON `session` (`id`);
--> statement-breakpoint
PRAGMA foreign_keys=ON;