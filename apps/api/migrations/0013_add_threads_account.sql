CREATE TABLE `threads_account` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` text NOT NULL,
  `threads_user_id` text NOT NULL,
  `threads_username` text,
  `access_token` text NOT NULL,
  `token_expires_at` integer,
  `connected_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `project`(`project_id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `threads_account_project_id_idx` ON `threads_account` (`project_id`);
