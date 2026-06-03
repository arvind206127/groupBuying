const db = require('../config/database');

let schemaReady = false;

const ensurePropertyDisplaySection = async () => {
  if (schemaReady) return;

  const columns = await db.$queryRawUnsafe(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'properties'
      AND COLUMN_NAME = 'displaySection'
  `);

  if (!columns.length) {
    await db.$executeRawUnsafe('ALTER TABLE `properties` ADD COLUMN `displaySection` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `isFeatured`');
  }

  const indexes = await db.$queryRawUnsafe(`
    SELECT INDEX_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'properties'
      AND INDEX_NAME = 'properties_displaySection_idx'
  `);

  if (!indexes.length) {
    await db.$executeRawUnsafe('CREATE INDEX `properties_displaySection_idx` ON `properties` (`displaySection`)');
  }

  schemaReady = true;
};

module.exports = ensurePropertyDisplaySection;
