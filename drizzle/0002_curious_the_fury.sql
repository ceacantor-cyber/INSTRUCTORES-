ALTER TABLE `evaluations` ADD `presentationPersonal` int NOT NULL;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `teachingExperience` int NOT NULL;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `respectfulAttention` int NOT NULL;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `explanationClarity` int NOT NULL;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `punctualitySafety` int NOT NULL;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `photoData` mediumtext;--> statement-breakpoint
ALTER TABLE `instructors` ADD `category` varchar(20) DEFAULT 'A2' NOT NULL;