CREATE TABLE `receipt` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`opened` integer DEFAULT false,
	`employee` integer NOT NULL,
	`company` integer NOT NULL,
	`payday` integer NOT NULL,
	`type` text NOT NULL,
	`validity` integer NOT NULL
);
