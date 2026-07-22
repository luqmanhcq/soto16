import postgres from 'postgres'
import http from 'http'
import crypto from 'crypto'

const simegilanSql = postgres('postgresql://postgres:1453@localhost:5432/simegilan', { max: 1 })
const sisotoSql = postgres('postgresql://postgres:1453@localhost:5432/sisoto', { max: 1 })

async function testRolePreservation() {
  const testNip = '198703052015041002' // The user we just created via SSO

  // 1. Manually set this user's role to 'admin'
  console.log('--- Testing Role Preservation ---')
  await sisotoSql`UPDATE users SET role = 'admin' WHERE nip = ${testNip}`
  const beforeUser = await sisotoSql`SELECT id, nip, nama, role FROM users WHERE nip = ${testNip}`
  console.log('✅ Before SSO (role set to admin):', JSON.stringify(beforeUser[0], null, 2))

  // 2. Insert a new SSO token
  const testToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  await simegilanSql`
    INSERT INTO sso_tokens (token, nip_baru, created_at, expired_at, is_used)
    VALUES (${testToken}, ${testNip}, NOW(), NOW() + INTERVAL '5 minutes', 0)
  `
  console.log('✅ New token inserted')

  // 3. Call SSO callback
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
      }

      res.resume()

      setTimeout(async () => {
        // 4. Check user role after SSO — should still be 'admin'
        const afterUser = await sisotoSql`SELECT id, nip, nama, role FROM users WHERE nip = ${testNip}`
        console.log('\n✅ After SSO:', JSON.stringify(afterUser[0], null, 2))

        if (afterUser[0].role === 'admin') {
          console.log('\n✅ ROLE PRESERVED! Role stayed as "admin" through SSO login.')
        } else {
          console.log(`\n❌ ROLE NOT PRESERVED! Expected "admin", got "${afterUser[0].role}"`)
        }

        // Reset role back to 'asn' for cleanup
        await sisotoSql`UPDATE users SET role = 'asn' WHERE nip = ${testNip}`
        console.log('✅ Reset role back to asn for cleanup')

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

testRolePreservation().then(() => {
  console.log('\n--- Role Preservation Test Complete ---')
  process.exit(0)
}).catch((e) => {
  console.error('Test failed:', e)
  process.exit(1)
})
