-- Add video metadata columns to project_videos table
ALTER TABLE `project_videos` 
ADD COLUMN `videoUrl` VARCHAR(191) AFTER `url`,
ADD COLUMN `duration` INT DEFAULT 0 COMMENT 'Duration in seconds',
ADD COLUMN `fileSizeMB` DECIMAL(10,2) DEFAULT 0 COMMENT 'Compressed file size in MB',
ADD COLUMN `showAfter` DATETIME(3) DEFAULT NULL COMMENT 'Schedule to show video after this timestamp';

-- Update existing rows to use url column as videoUrl if videoUrl is empty
UPDATE `project_videos` SET `videoUrl` = `url` WHERE `videoUrl` IS NULL OR `videoUrl` = '';
