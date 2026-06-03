-- Create subscription_plans table for admin to manage subscription types
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('MINIMAL', 'NORMAL', 'PREMIUM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `annualPrice` decimal(10,2) NOT NULL,
  `maxProperties` int NOT NULL DEFAULT 5,
  `maxGroups` int NOT NULL DEFAULT 10,
  `features` longtext COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `displayOrder` int DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_plans_type_key` (`type`),
  KEY `subscription_plans_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default subscription plans
INSERT IGNORE INTO `subscription_plans` VALUES 
  ('plan-minimal-001', 'Minimal Plan', 'MINIMAL', 499.00, 4990.00, 3, 5, 'Basic features\nLimited support\nUp to 3 properties', 'Perfect for small investors', 1, 1, NOW(3), NOW(3)),
  ('plan-normal-001', 'Normal Plan', 'NORMAL', 999.00, 9990.00, 10, 20, 'All features\nPriority support\nUp to 10 properties\nAdvanced analytics', 'For active investors', 1, 2, NOW(3), NOW(3)),
  ('plan-premium-001', 'Premium Plan', 'PREMIUM', 2499.00, 24990.00, 50, 100, 'All features\nDedicated support\nUnlimited properties\nAdvanced analytics\nCustom reporting', 'For professional dealers', 1, 3, NOW(3), NOW(3));
