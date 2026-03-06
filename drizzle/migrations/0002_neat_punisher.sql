CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`responded` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contacts_email_idx` ON `contacts` (`email`);--> statement-breakpoint
CREATE INDEX `contacts_read_idx` ON `contacts` (`read`);--> statement-breakpoint
ALTER TABLE `lessons` ADD `key_concepts` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `teacher_id` text REFERENCES teachers(id);--> statement-breakpoint
CREATE INDEX `reviews_teacher_id_idx` ON `reviews` (`teacher_id`);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;