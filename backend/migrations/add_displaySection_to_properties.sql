-- Add displaySection column to properties table
ALTER TABLE `properties` ADD COLUMN `displaySection` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `isFeatured`;

-- Create index for faster queries
CREATE INDEX `properties_displaySection_idx` ON `properties` (`displaySection`);
