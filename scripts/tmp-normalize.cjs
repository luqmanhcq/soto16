const postgres = require('../node_modules/postgres/src/index.js');
const sql = (postgres.default || postgres)('postgresql://postgres:1453@localhost:5432/sisoto', { max: 1 });
(async () => {
  const r = await sql.unsafe("UPDATE siasn_riwayat_sync SET error_msg = 'FILE_PENDING: ' || error_msg WHERE status='synced' AND error_msg IS NOT NULL AND error_msg NOT LIKE 'FILE_PENDING:%'");
  console.log('normalized rows:', r.count);
  const b = await sql`SELECT COUNT(*) AS c FROM siasn_riwayat_sync WHERE status='synced' AND error_msg LIKE 'FILE_PENDING:%'`;
  console.log('file_pending now:', b[0].c);
  await sql.end();
})();
