CREATE TABLE `instruction_guide` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`form_name` text NOT NULL,
	`text` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instruction_guide_form_name_unique` ON `instruction_guide` (`form_name`);
