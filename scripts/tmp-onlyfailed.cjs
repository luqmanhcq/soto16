const jwt = require('../node_modules/jsonwebtoken');
const fs = require('fs');
const c = fs.readFileSync('ecosystem.config.cjs', 'utf8');
const token = jwt.sign({ id: 1, email: 'a@a.id', role: 'super_admin' }, c.match(/JWT_SECRET:\s*'([^']+)'/)[1], { expiresIn: '30m' });
async function main() {
  const limit = Number(process.argv[2] || 3);
  const offset = Number(process.argv[3] || 0);
  const res = await fetch(`http://localhost:3001/api/admin/webinar/11/siasn-bulk?stream=1&limit=${limit}&offset=${offset}&onlyFailed=1`, {
    headers: { Cookie: `token=${token}` },
  });
  const text = await res.text();
  const events = text.split('\n\n').filter(Boolean);
  for (const e of events) {
    const line = e.split('\n').find(l => l.startsWith('data:'));
    if (!line) { console.log('(keepalive)'); continue; }
    const d = JSON.parse(line.slice(6));
    if (d.type === 'progress') console.log(`[${d.current}/${d.total}] ${d.row.nip} => ${d.row.sync_result} | ${d.row.message || ''}`);
    else if (d.type === 'done') console.log('DONE summary:', JSON.stringify(d.summary));
    else console.log(d.type, d.message || '');
  }
}
main().catch(e => { console.error(e); process.exit(1); });
