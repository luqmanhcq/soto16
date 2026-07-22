import postgres from 'postgres'
import http from 'http'

const simegilanSql = postgres('postgresql://postgres:1453@localhost:5432/simegilan', { max: 1 })
const sisotoSql = postgres('postgresql://postgres:1453@localhost:5432/sisoto', { max: 1 })

async function testSsoFlow() {
  // Use a known NIP from the pegawai table
  const testNip = '198703052015041002' // This NIP appeared in sso_tokens earlier

  // 1. Insert a fresh test token into sso_tokens
  const testToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  console.log('Test NIP:', testNip)
  console.log('Test Token:', testToken)

  await simegilanSql`
    INSERT INTO sso_tokens (token, nip_baru, created_at, expired_at, is_used)
    VALUES (${testToken}, ${testNip}, NOW(), NOW() + INTERVAL '5 minutes', 0)
  `
  console.log('✅ Token inserted into sso_tokens')

  // 2. Check if pegawai data exists for this NIP
  const pegawai = await simegilanSql`
    SELECT nip_baru, nama, gelar_depan, gelar_belakang, email, satker_id, gol_akhir
    FROM pegawai WHERE nip_baru = ${testNip} LIMIT 1
  `
  console.log('✅ Pegawai data:', JSON.stringify(pegawai[0], null, 2))

  // 3. Check current users in sisoto before SSO
  const usersBefore = await sisotoSql`SELECT id, nip, nama, email, role FROM users WHERE nip = ${testNip}`
  console.log('✅ Users before SSO:', usersBefore.length, 'records')
  if (usersBefore.length > 0) {
    console.log('  Existing user:', JSON.stringify(usersBefore[0], null, 2))
  }

  // 4. Call the SSO callback endpoint
  console.log('\n--- Calling SSO callback ---')
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/auth/sso-callback?token=${testToken}`,
    method: 'GET',
    headers: { 'Cookie': '' }, // No existing cookie
  }

  return new Promise<void>((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('Status:', res.statusCode)
      console.log('Location:', res.headers.location || 'none')

      // Check for Set-Cookie header
      const setCookie = res.headers['set-cookie']
      if (setCookie) {
        console.log('✅ Set-Cookie:', setCookie[0].substring(0, 80) + '...')
      } else {
        console.log('❌ No Set-Cookie header')
      }

      res.resume()

      // 5. Check users in sisoto after SSO
      setTimeout(async () => {
        const usersAfter = await sisotoSql`SELECT id, nip, nama, email, role FROM users WHERE nip = ${testNip}`
        console.log('\n✅ Users after SSO:', usersAfter.length, 'records')
        if (usersAfter.length > 0) {
          console.log('  User:', JSON.stringify(usersAfter[0], null, 2))
        }

        // 6. Check if token was consumed (is_used = 1)
        const tokenStatus = await simegilanSql`SELECT is_used FROM sso_tokens WHERE token = ${testToken}`
        console.log('✅ Token is_used:', tokenStatus[0]?.is_used)

        await simegilanSql.end()
        await sisotoSql.end()
        resolve()
      }, 2000)
    })

    req.on('error', (e) => {
      console.error('Error:', e.message)
      reject(e)
    })

    req.end()
  })
}

import crypto from 'crypto'

testSsoFlow().then(() => {
  console.log('\n--- SSO Test Complete ---')
  process.exit(0)
}).catch((e) => {
  console.error('Test failed:', e)
  process.exit(1)
})
