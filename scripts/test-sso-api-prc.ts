import postgres from 'postgres'
import http from 'http'

const simegilanSql = postgres('postgresql://postgres:1453@localhost:5432/simegilan', { max: 1 })
const sisotoSql = postgres('postgresql://postgres:1453@localhost:5432/sisoto', { max: 1 })

async function main() {
  const testNip = '198703052015041002'
  const crypto = await import('crypto')
  const testToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

  // Insert token using PHP's timezone (PRC = UTC+8)
  // PHP's date('Y-m-d H:i:s') would be 1 hour ahead of PostgreSQL's NOW() (Bangkok = UTC+7)
  // So we add 1 hour to match PHP's timezone
  await simegilanSql`
    INSERT INTO sso_tokens (token, nip_baru, created_at, expired_at, is_used)
    VALUES (${testToken}, ${testNip}, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '1 hour' + INTERVAL '5 minutes', 0)
  `
  console.log('✅ Token inserted with PRC timezone adjustment')

  // Verify the token
  const tokenData = await simegilanSql`
    SELECT created_at::text as created, expired_at::text as expired, is_used
    FROM sso_tokens WHERE token = ${testToken}
  `
  console.log('Token:', JSON.stringify(tokenData[0], null, 2))

  // Call the SiMEGILAN API directly
  console.log('\n--- Calling SiMEGILAN API directly ---')
  const postData = JSON.stringify({ token: testToken })

  const result = await new Promise<any>((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 80,
      path: '/api/validate_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Host': 'simegilan.lamongankab.go.id',
      },
    }, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        console.log('API Status:', res.statusCode)
        console.log('API Response:', body)
        resolve({ status: res.statusCode, body })
      })
    })
    req.on('error', (e) => { console.error('API Error:', e.message); resolve(null) })
    req.write(postData)
    req.end()
  })

  if (result && result.status === 200) {
    // Now test the full SSO callback flow
    console.log('\n--- Testing SSO callback with new token ---')
    const testToken2 = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
    await simegilanSql`
      INSERT INTO sso_tokens (token, nip_baru, created_at, expired_at, is_used)
      VALUES (${testToken2}, ${testNip}, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '1 hour' + INTERVAL '5 minutes', 0)
    `

    const usersBefore = await sisotoSql`SELECT id, nip, nama, role FROM users WHERE nip = ${testNip}`
    console.log('Before SSO:', JSON.stringify(usersBefore[0] || 'not found'))

    const ssoResult = await new Promise<any>((resolve) => {
      http.get({
        hostname: 'localhost',
        port: 3001,
        path: `/api/auth/sso-callback?token=${testToken2}`,
        headers: { 'Cookie': '' },
      }, (res) => {
        console.log('SSO Status:', res.statusCode)
        console.log('SSO Location:', res.headers.location || 'none')
        const setCookie = res.headers['set-cookie']
        if (setCookie) console.log('✅ Set-Cookie received')
        res.resume()
        res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location }))
      }).on('error', (e) => { console.error('Error:', e.message); resolve(null) })
    })

    // Wait for DB update
    await new Promise(r => setTimeout(r, 2000))

    const usersAfter = await sisotoSql`SELECT id, nip, nama, role FROM users WHERE nip = ${testNip}`
    console.log('After SSO:', JSON.stringify(usersAfter[0] || 'not found'))

    const tokenAfter = await simegilanSql`SELECT is_used FROM sso_tokens WHERE token = ${testToken2}`
    console.log('Token is_used:', tokenAfter[0]?.is_used)
  }

  await simegilanSql.end()
  await sisotoSql.end()
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
