CREATE TABLE `study_guides` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`file_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `study_guides_unit_id_idx` ON `study_guides` (`unit_id`);--> statement-breakpoint
CREATE TABLE `video_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text,
	`title` text NOT NULL,
	`description` text,
	`video_url` text NOT NULL,
	`video_id` text,
	`duration` integer,
	`thumbnail_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `video_resources_unit_id_idx` ON `video_resources` (`unit_id`);--> statement-breakpoint
CREATE TABLE `worksheets` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text,
	`title` text NOT NULL,
	`description` text,
	`file_url` text,
	`difficulty` text,
	`estimated_time` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `worksheets_unit_id_idx` ON `worksheets` (`unit_id`);