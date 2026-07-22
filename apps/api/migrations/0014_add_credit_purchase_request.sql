CREATE TABLE `credit_purchase_request` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`payment_method` text NOT NULL,
	`transfer_name` text,
	`note` text,
	`credits` integer NOT NULL,
	`amount_yen` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`reviewed_at` integer,
	`approved_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`project_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `credit_purchase_request_project_id_idx` ON `credit_purchase_request` (`project_id`);
--> statement-breakpoint
CREATE INDEX `credit_purchase_request_status_idx` ON `credit_purchase_request` (`status`);
--> statement-breakpoint
CREATE INDEX `credit_purchase_request_approved_at_idx` ON `credit_purchase_request` (`approved_at`);
