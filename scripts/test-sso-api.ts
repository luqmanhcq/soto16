import postgres from 'postgres'
import http from 'http'
import https from 'https'
import crypto from 'crypto'

const simegilanSql = postgres('postgresql://postgres:1453@localhost:5432/simegilan', { max: 1 })
const sisotoSql = postgres('postgresql://postgres:1453@localhost:5432/sisoto', { max: 1 })

async function testSsoApiFlow() {
  // Use a known NIP from the pegawai table
  const testNip = '198703052015041002'

  // 1. Insert a fresh test token into sso_tokens
  const testToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  console.log('Test NIP:', testNip)
  console.log('Test Token:', testToken)

  await simegilanSql`
    INSERT INTO sso_tokens (token, nip_baru, created_at, expired_at, is_used)
    VALUES (${testToken}, ${testNip}, NOW(), NOW() + INTERVAL '5 minutes', 0)
  `
  console.log('✅ Token inserted into sso_tokens')

  // 2. Check user in sisoto before SSO
  const usersBefore = await sisotoSql`SELECT id, nip, nama, email, role FROM users WHERE nip = ${testNip}`
  console.log('✅ Users before SSO:', usersBefore.length, 'records')
  if (usersBefore.length > 0) {
    console.log('  Existing user:', JSON.stringify(usersBefore[0], null, 2))
  }

  // 3. Call the SSO callback endpoint (which calls SiMEGILAN's Api::validate_token)
  console.log('\n--- Calling SSO callback (which calls SiMEGILAN API) ---')
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/auth/sso-callback?token=${testToken}`,
    method: 'GET',
    headers: { 'Cookie': '' },
  }

  return new Promise<void>((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('Status:', res.statusCode)
      console.log('Location:', res.headers.location || 'none')

      const setCookie = res.headers['set-cookie']
      if (setCookie) {
        console.log('✅ Set-Cookie received')
      } else {
        console.log('❌ No Set-Cookie header')
      }

      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', async () => {
        if (res.statusCode !== 307) {
          console.log('Response body:', body.substring(0, 500))
        }

        // 4. Check user in sisoto after SSO
        setTimeout(async () => {
          const usersAfter = await sisotoSql`SELECT id, nip, nama, email, role FROM users WHERE nip = ${testNip}`
          console.log('\n✅ Users after SSO:', usersAfter.length, 'records')
          if (usersAfter.length > 0) {
            console.log('  User:', JSON.stringify(usersAfter[0], null, 2))
          }

          // 5. Check if token was consumed
          const tokenStatus = await simegilanSql`SELECT is_used FROM sso_tokens WHERE token = ${testToken}`
          console.log('✅ Token is_used:', tokenStatus[0]?.is_used)

          await simegilanSql.end()
          await sisotoSql.end()
          resolve()
        }, 3000)
      })
    })

    req.on('error', (e) => {
      console.error('Error:', e.message)
      reject(e)
    })

    req.end()
  })
}

testSsoApiFlow().then(() => {
  console.log('\n--- SSO API Test Complete ---')
  process.exit(0)
}).catch((e) => {
  console.error('Test failed:', e)
  process.exit(1)
})
