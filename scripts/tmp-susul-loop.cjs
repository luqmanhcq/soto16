const jwt = require('../node_modules/jsonwebtoken');
const fs = require('fs');
const postgres = require('../node_modules/postgres/src/index.js');

async function pendingCount() {
  const sql = (postgres.default || postgres)('postgresql://postgres:1453@localhost:5432/sisoto', { max: 1 });
  const r = await sql`SELECT COUNT(*) AS c FROM siasn_riwayat_sync WHERE status='synced' AND error_msg LIKE 'FILE_PENDING:%'`;
  await sql.end();
  return Number(r[0].c);
}

async function main() {
  const batch = Number(process.argv[2] || 10);
  const c = fs.readFileSync('ecosystem.config.cjs', 'utf8');
  const m = c.match(/JWT_SECRET:\s*'([^']+)'/);
  const token = jwt.sign({ id: 1, email: 'a@a.id', role: 'super_admin' }, m[1], { expiresIn: '120m' });
  let round = 0;
  let totalDone = 0;
  while (true) {
    round++;
    const left = await pendingCount();
    console.log(`\n=== round ${round}: sisa ${left} ===`);
    if (left === 0) break;
    const res = await fetch('http://localhost:3001/api/admin/webinar/11/siasn-bulk/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: `token=${token}` },
      body: JSON.stringify({ limit: batch }),
    });
    const j = await res.json();
    totalDone += (j.done || 0);
    console.log(`done batch: ${j.done}, still_pending: ${j.still_pending}`);
    for (const d of (j.details || [])) console.log(` - ${d.nip}: ${d.ok ? 'OK' : 'GAGAL'} ${d.message || ''}`);
    if ((j.done || 0) === 0) {
      // tidak ada kemajuan (semua abort/timeout) — jeda lalu coba lagi, batasi 5 ronde gagal beruntun
      const leftAfter = await pendingCount();
      if (leftAfter >= left) {
        console.log('tidak ada kemajuan, jeda 60 detik...');
        await new Promise(r => setTimeout(r, 60000));
      }
    }
    if (round > 60) { console.log('batas ronde tercapai, berhenti'); break; }
  }
  console.log(`\nSELESAI. total file tersusul sesi ini: ${totalDone}`);
}
main().catch(e => { console.error(e); process.exit(1); });
