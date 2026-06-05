const db = require('../config/database');

let schemaReady = false;

const PROPERTY_DETAIL_COLUMNS = [
  { name: 'unitCount', definition: '`unitCount` INT NULL DEFAULT NULL' },
  { name: 'possessionStatus', definition: '`possessionStatus` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL' },
  { name: 'reraId', definition: '`reraId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL' },
  { name: 'propertyAreaAcres', definition: '`propertyAreaAcres` decimal(10,2) DEFAULT NULL' },
  { name: 'possessionDate', definition: '`possessionDate` datetime(3) DEFAULT NULL' },
  { name: 'launchDate', definition: '`launchDate` datetime(3) DEFAULT NULL' },
  { name: 'highlights', definition: '`highlights` json DEFAULT NULL' },
  { name: 'masterPlanImage', definition: '`masterPlanImage` text COLLATE utf8mb4_unicode_ci' },
  { name: 'layoutPlanUrl', definition: '`layoutPlanUrl` text COLLATE utf8mb4_unicode_ci' },
  { name: 'floorPlans', definition: '`floorPlans` json DEFAULT NULL' },
  { name: 'specifications', definition: '`specifications` json DEFAULT NULL' },
  { name: 'locationUrl', definition: '`locationUrl` text COLLATE utf8mb4_unicode_ci' },
  { name: 'nearbyPlaces', definition: '`nearbyPlaces` json DEFAULT NULL' },
  { name: 'developerLogo', definition: '`developerLogo` text COLLATE utf8mb4_unicode_ci' },
  { name: 'developerDescription', definition: '`developerDescription` text COLLATE utf8mb4_unicode_ci' },
  { name: 'developerTotalProjects', definition: '`developerTotalProjects` INT NULL DEFAULT NULL' },
  { name: 'developerExperienceYears', definition: '`developerExperienceYears` INT NULL DEFAULT NULL' },
];

const ensurePropertyDetailFields = async () => {
  if (schemaReady) return;

  const existingColumns = await db.$queryRawUnsafe(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'properties'
  `);

  const existingColumnNames = new Set(existingColumns.map((column) => column.COLUMN_NAME));

  for (const column of PROPERTY_DETAIL_COLUMNS) {
    if (!existingColumnNames.has(column.name)) {
      await db.$executeRawUnsafe(`ALTER TABLE \`properties\` ADD COLUMN ${column.definition}`);
    }
  }

  schemaReady = true;
};

module.exports = ensurePropertyDetailFields;
