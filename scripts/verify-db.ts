import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function main() {
  try {
    // List all tables
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
    console.log('=== TABLES ===')
    for (const t of tables) {
      const count = await sql`SELECT COUNT(*) as cnt FROM ${sql(t.tablename)}`
      console.log(`  ${t.tablename}: ${count[0].cnt} rows`)
    }

    // List all enum types
    const enums = await sql`SELECT t.typname, string_agg(e.enumlabel, ', ') as labels FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid JOIN pg_enum e ON e.enumtypid = t.oid WHERE n.nspname='public' AND t.typtype='e' GROUP BY t.typname ORDER BY t.typname`
    console.log('\n=== ENUMS ===')
    for (const e of enums) {
      console.log(`  ${e.typname}: ${e.labels}`)
    }

    // Check drizzle migrations
    const migrations = await sql`SELECT id, hash FROM drizzle.__drizzle_migrations ORDER BY id`
    console.log('\n=== DRIZZLE MIGRATIONS ===')
    for (const m of migrations) {
      console.log(`  id=${m.id}, hash=${m.hash.substring(0, 16)}...`)
    }

    // Show users
    const users = await sql`SELECT id, nip, nama, email, role FROM users ORDER BY id`
    console.log('\n=== USERS ===')
    for (const u of users) {
      console.log(`  [${u.id}] ${u.nama} (${u.role}) - ${u.email} - NIP: ${u.nip}`)
    }

    await sql.end()
    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    await sql.end()
    process.exit(1)
  }
}

main()
