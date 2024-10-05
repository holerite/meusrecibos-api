CREATE TABLE `employee_to_company` (
	`emloyee_id` integer NOT NULL,
	`company_id` integer NOT NULL,
	PRIMARY KEY(`emloyee_id`, `company_id`),
	FOREIGN KEY (`emloyee_id`) REFERENCES `employee`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE no action
);
