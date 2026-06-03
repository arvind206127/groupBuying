const mysql = require('mysql2/promise');

const run = async () => {
    const pool = mysql.createPool({
        uri: 'mysql://root:Chirag30kum%40r@localhost:3306/groupbuying',
        waitForConnections: true,
        connectionLimit: 1,
    });

    try {
        console.log('Creating admins table...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS \`admins\` (
                \`id\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
                \`email\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
                \`name\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                \`phone\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                \`role\` enum('SUPERADMIN','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ADMIN',
                \`isActive\` tinyint(1) NOT NULL DEFAULT '1',
                \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                \`updatedAt\` datetime(3) NOT NULL,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`admins_email_key\` (\`email\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('Altering developers table...');
        try {
            await pool.execute(`ALTER TABLE \`developers\` ADD COLUMN \`email\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL;`);
        } catch (e) { if (!e.message.includes('Duplicate column name')) throw e; }
        
        try {
            await pool.execute(`ALTER TABLE \`developers\` ADD COLUMN \`phone\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL;`);
        } catch (e) { if (!e.message.includes('Duplicate column name')) throw e; }

        console.log('Dropping otps foreign key...');
        try {
            await pool.execute(`ALTER TABLE \`otps\` DROP FOREIGN KEY \`otps_email_fkey\`;`);
        } catch (e) { console.log(e.message); }

        console.log('Migrating admin users...');
        await pool.execute(`
            INSERT IGNORE INTO \`admins\` (\`id\`, \`email\`, \`name\`, \`phone\`, \`role\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) 
            SELECT \`id\`, \`email\`, \`name\`, \`phone\`, 'ADMIN', \`isActive\`, \`createdAt\`, \`updatedAt\` FROM \`users\` WHERE \`role\` = 'ADMIN';
        `);

        console.log('Cleaning up old admin users...');
        await pool.execute(`DELETE FROM \`users\` WHERE \`role\` = 'ADMIN';`);

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

run();
