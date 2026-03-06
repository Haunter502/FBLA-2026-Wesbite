CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`link` text,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `notifications_read_idx` ON `notifications` (`read`);--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`created_at`);--> statement-breakpoint
ALTER TABLE `lessons` ADD `content` text;--> statement-breakpoint
ALTER TABLE `tutoring_requests` ADD `matched_teacher_id` text REFERENCES teachers(id);--> statement-breakpoint
ALTER TABLE `tutoring_requests` ADD `matched_slot_id` text REFERENCES tutoring_slots(id);--> statement-breakpoint
ALTER TABLE `tutoring_requests` ADD `match_status` text;--> statement-breakpoint
ALTER TABLE `tutoring_requests` ADD `match_response` text;--> statement-breakpoint
CREATE INDEX `tutoring_requests_matched_teacher_id_idx` ON `tutoring_requests` (`matched_teacher_id`);