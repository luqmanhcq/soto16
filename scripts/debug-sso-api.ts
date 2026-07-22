import postgres from 'postgres'
import http from 'http'

const simegilanSql = postgres('postgresql://postgres:1453@localhost:5432/simegilan', { max: 1 })

async function main() {
  // Check PostgreSQL timezone
  const pgTz = await simegilanSql`SHOW timezone`
  console.log('PostgreSQL timezone:', pgTz[0])

  // Check PostgreSQL current time
  const pgNow = await simegilanSql`SELECT NOW() as now, CURRENT_TIMESTAMP as ts`
  console.log('PostgreSQL NOW():', pgNow[0].now)
  console.log('PostgreSQL CURRENT_TIMESTAMP:', pgNow[0].ts)

  // Insert a test token and check what it looks like
  const crypto = await import('crypto')
  const testToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const testNip = '198703052015041002'

  await simegilanSql`
    INSERT INTO sso_tokens (token, nip_baru, created_at, expired_at, is_used)
    VALUES (${testToken}, ${testNip}, NOW(), NOW() + INTERVAL '5 minutes', 0)
  `

  const tokenData = await simegilanSql`SELECT token, nip_baru, created_at, expired_at, is_used FROM sso_tokens WHERE token = ${testToken}`
  console.log('\nToken data:', JSON.stringify(tokenData[0], null, 2))

  // Now call the SiMEGILAN API directly
  console.log('\n--- Calling SiMEGILAN API directly ---')
  const postData = JSON.stringify({ token: testToken })

  const options = {
    hostname: 'localhost',
    port: 80,
    path: '/api/validate_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Host': 'simegilan.lamongankab.go.id',
    },
  }

  return new Promise<void>((resolve) => {
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        console.log('API Status:', res.statusCode)
        console.log('API Response:', body)
        resolve()
      })
    })

    req.on('error', (e) => {
      console.error('API Error:', e.message)
      resolve()
    })

    req.write(postData)
    req.end()
  }).then(async () => {
    // Check if token was consumed
    const after = await simegilanSql`SELECT is_used FROM sso_tokens WHERE token = ${testToken}`
    console.log('\nToken is_used after API call:', after[0]?.is_used)
    await simegilanSql.end()
    process.exit(0)
  })
}

main().catch((e) => { console.error(e); process.exit(1) })
