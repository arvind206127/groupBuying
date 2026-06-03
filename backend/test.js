const db = require('./src/config/database');
async function run() {
  const q = await db.oTP.findFirst({where: {email: 'admin@realtogather.com', isUsed: false, expiresAt: {gt: new Date()}}});
  console.log('Result:', q);
}
run().catch(console.error).finally(() => db.pool.end());
