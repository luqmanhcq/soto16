import postgres from 'postgres'

const sql = postgres('postgresql://postgres:1453@localhost:5432/simegilan', { max: 1 })

async function main() {
  // Check sso_tokens column types
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'sso_tokens'
    ORDER BY ordinal_position
  `
  console.log('=== sso_tokens columns ===')
  for (const c of cols) {
    console.log(`  ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`)
  }

  // Check the raw stored values (without timezone conversion)
  const raw = await sql`
    SELECT token, created_at::text as created_text, expired_at::text as expired_text, is_used
    FROM sso_tokens ORDER BY created_at DESC LIMIT 3
  `
  console.log('\n=== Recent tokens (raw text) ===')
  for (const r of raw) {
    console.log(`  token: ${r.token.substring(0, 20)}...`)
    console.log(`  created: ${r.created_text}`)
    console.log(`  expired: ${r.expired_text}`)
    console.log(`  is_used: ${r.is_used}`)
    console.log('')
  }

  // Check PHP timezone from php.ini
  const fs = await import('fs')
  try {
    const phpini = fs.readFileSync('C:/BtSoft/php/74/php.ini', 'utf-8')
    const tzMatch = phpini.match(/^date\.timezone\s*=\s*(.+)$/m)
    console.log('PHP date.timezone:', tzMatch ? tzMatch[1].trim() : 'not found')
  } catch {
    // Try other paths
    try {
      const phpini = fs.readFileSync('C:/php/php.ini', 'utf-8')
      const tzMatch = phpini.match(/^date\.timezone\s*=\s*(.+)$/m)
      console.log('PHP date.timezone:', tzMatch ? tzMatch[1].trim() : 'not found')
    } catch {
      console.log('PHP php.ini not found at common paths')
    }
  }

  await sql.end()
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
