import postgres from 'postgres'

const sql = postgres('postgresql://postgres:1453@localhost:5432/sisoto', { max: 1 })

async function main() {
  const nip = '1993102920220310002'

  // Check if user exists
  const before = await sql`SELECT id, nip, nama, email, role FROM users WHERE nip = ${nip}`
  console.log('Before:', JSON.stringify(before, null, 2))

  if (before.length > 0) {
    // Update existing user to super_admin
    await sql`UPDATE users SET role = 'super_admin' WHERE nip = ${nip}`
    const after = await sql`SELECT id, nip, nama, email, role FROM users WHERE nip = ${nip}`
    console.log('After:', JSON.stringify(after, null, 2))
    console.log('✅ Role updated to super_admin')
  } else {
    console.log('User not found in database yet.')
    console.log('They will get super_admin role on first SSO login via SSO_SUPER_ADMIN_NIPS env var.')
  }

  await sql.end()
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
