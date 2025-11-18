CREATE TABLE `direct_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`message` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `direct_messages_sender_id_idx` ON `direct_messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `direct_messages_receiver_id_idx` ON `direct_messages` (`receiver_id`);--> statement-breakpoint
CREATE INDEX `direct_messages_created_at_idx` ON `direct_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `direct_messages_conversation_idx` ON `direct_messages` (`sender_id`,`receiver_id`);--> statement-breakpoint
ALTER TABLE `lessons` DROP COLUMN `key_concepts`;