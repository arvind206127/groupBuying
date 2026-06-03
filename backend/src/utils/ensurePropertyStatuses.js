const db = require('../config/database');

const DEFAULT_STATUSES = [
  { key: 'UNDER_CONSTRUCTION', name: 'Under Construction' },
  { key: 'READY_TO_MOVE', name: 'Ready to Move' },
  { key: 'PRE_LAUNCH', name: 'Pre-Launch' },
  { key: 'SOLD', name: 'Sold Out' }
];

let schemaReady = false;

const ensurePropertyStatuses = async () => {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`property_statuses\` (
      \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
      \`name\` VARCHAR(100) NOT NULL UNIQUE,
      \`isActive\` TINYINT(1) DEFAULT 1,
      \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const columns = await db.$queryRawUnsafe(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'properties'
      AND COLUMN_NAME = 'propertyStatusId'
  `);

  if (!columns.length) {
    await db.$executeRawUnsafe('ALTER TABLE `properties` ADD COLUMN `propertyStatusId` VARCHAR(36) NULL DEFAULT NULL');
  }

  const statusesByName = new Map();
  for (const statusData of DEFAULT_STATUSES) {
    const existing = await db.propertyStatus.findUnique({ where: { name: statusData.name } }).catch(() => null);
    const status = existing || await db.propertyStatus.create({
      data: {
        name: statusData.name,
        isActive: true
      }
    });
    statusesByName.set(statusData.name, status);
  }

  for (const statusData of DEFAULT_STATUSES) {
    const status = statusesByName.get(statusData.name);
    if (!status) continue;

    await db.property.updateMany({
      where: { status: statusData.key, propertyStatusId: null },
      data: { propertyStatusId: status.id }
    });
  }

  schemaReady = true;
};

const ensurePropertyStatusesOnce = async () => {
  if (schemaReady) return;
  await ensurePropertyStatuses();
};

module.exports = ensurePropertyStatusesOnce;
