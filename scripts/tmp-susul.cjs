const postgres = require('../node_modules/postgres/src/index.js');
async function main() {
  const limit = Number(process.argv[2] || 5);
  // dynamic import TS service via tsx is not available in plain node; call HTTP endpoint instead
  const jwt = require('../node_modules/jsonwebtoken');
  const fs = require('fs');
  const c = fs.readFileSync('ecosystem.config.cjs', 'utf8');
  const m = c.match(/JWT_SECRET:\s*'([^']+)'/);
  const token = jwt.sign({ id: 1, email: 'a@a.id', role: 'super_admin' }, m[1], { expiresIn: '30m' });
  const res = await fetch('http://localhost:3001/api/admin/webinar/11/siasn-bulk/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `token=${token}` },
    body: JSON.stringify({ limit }),
  });
  const j = await res.json();
  console.log(JSON.stringify(j, null, 1).slice(0, 3000));
}
main();
