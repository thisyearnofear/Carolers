CREATE TABLE `carol_translations` (
	`id` varchar(191) NOT NULL,
	`carol_id` varchar(191) NOT NULL,
	`language` varchar(10) NOT NULL,
	`title` text NOT NULL,
	`lyrics` json,
	`upvotes` int DEFAULT 0,
	`downvotes` int DEFAULT 0,
	`is_canonical` int DEFAULT 0,
	`created_by` varchar(191),
	`source` varchar(50) DEFAULT 'ai_generated',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `carol_translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carols` (
	`id` varchar(191) NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`tags` json,
	`duration` text NOT NULL,
	`lyrics` json,
	`language` varchar(10) DEFAULT 'en',
	`energy` varchar(50) NOT NULL,
	`cover_url` text,
	`votes` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `carols_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` varchar(191) NOT NULL,
	`event_id` varchar(191) NOT NULL,
	`member_id` varchar(191) NOT NULL,
	`item` text NOT NULL,
	`status` varchar(50) DEFAULT 'proposed',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contributor_reputation` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`language` varchar(10) NOT NULL,
	`translations_approved` int DEFAULT 0,
	`proposals_approved` int DEFAULT 0,
	`rep_points` int DEFAULT 0,
	`is_moderator` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `contributor_reputation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` varchar(191) NOT NULL,
	`name` text NOT NULL,
	`date` datetime NOT NULL,
	`theme` text NOT NULL,
	`venue` text,
	`description` text NOT NULL,
	`members` json,
	`carols` json,
	`cover_image` text,
	`is_private` int DEFAULT 0,
	`password` text,
	`pinned_message` text,
	`created_by` varchar(191) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(191) NOT NULL,
	`event_id` varchar(191) NOT NULL,
	`member_id` varchar(191) NOT NULL,
	`text` text NOT NULL,
	`type` varchar(50) DEFAULT 'text',
	`payload` json,
	`timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposal_votes` (
	`id` varchar(191) NOT NULL,
	`proposal_id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`vote` int NOT NULL,
	`voting_power` int DEFAULT 1,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `proposal_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_history` (
	`id` varchar(191) NOT NULL,
	`translation_id` varchar(191) NOT NULL,
	`proposal_id` varchar(191),
	`previous_title` text,
	`previous_lyrics` json,
	`changed_by` varchar(191) NOT NULL,
	`change_reason` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `translation_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_proposals` (
	`id` varchar(191) NOT NULL,
	`translation_id` varchar(191) NOT NULL,
	`proposed_by` varchar(191) NOT NULL,
	`new_title` text,
	`new_lyrics` json,
	`change_reason` text,
	`status` varchar(50) DEFAULT 'pending',
	`upvotes` int DEFAULT 0,
	`downvotes` int DEFAULT 0,
	`required_quorum` int DEFAULT 5,
	`voting_ends_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `translation_proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`image_url` text,
	`preferred_language` varchar(10) DEFAULT 'en',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `carol_translations` ADD CONSTRAINT `carol_translations_carol_id_carols_id_fk` FOREIGN KEY (`carol_id`) REFERENCES `carols`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carol_translations` ADD CONSTRAINT `carol_translations_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_member_id_users_id_fk` FOREIGN KEY (`member_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contributor_reputation` ADD CONSTRAINT `contributor_reputation_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_member_id_users_id_fk` FOREIGN KEY (`member_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `proposal_votes` ADD CONSTRAINT `proposal_votes_proposal_id_translation_proposals_id_fk` FOREIGN KEY (`proposal_id`) REFERENCES `translation_proposals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `proposal_votes` ADD CONSTRAINT `proposal_votes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translation_history` ADD CONSTRAINT `translation_history_translation_id_carol_translations_id_fk` FOREIGN KEY (`translation_id`) REFERENCES `carol_translations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translation_history` ADD CONSTRAINT `translation_history_proposal_id_translation_proposals_id_fk` FOREIGN KEY (`proposal_id`) REFERENCES `translation_proposals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translation_history` ADD CONSTRAINT `translation_history_changed_by_users_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translation_proposals` ADD CONSTRAINT `translation_proposals_translation_id_carol_translations_id_fk` FOREIGN KEY (`translation_id`) REFERENCES `carol_translations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translation_proposals` ADD CONSTRAINT `translation_proposals_proposed_by_users_id_fk` FOREIGN KEY (`proposed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;