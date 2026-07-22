import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function main() {
  try {
    // Check if we can connect
    const result = await sql`SELECT current_database() as db, version() as version`
    console.log('Connected to:', result[0].db)
    console.log('Version:', result[0].version)

    // List all tables
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
    console.log('\nTables in public schema:')
    if (tables.length === 0) {
      console.log('  (no tables found)')
    } else {
      for (const t of tables) {
        console.log(`  - ${t.tablename}`)
      }
    }

    // List all enum types
    const enums = await sql`SELECT t.typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname='public' AND t.typtype='e' ORDER BY t.typname`
    console.log('\nEnum types:')
    if (enums.length === 0) {
      console.log('  (no enums found)')
    } else {
      for (const e of enums) {
        console.log(`  - ${e.typname}`)
      }
    }

    // Check for drizzle migrations table
    const migrations = await sql`SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at`.catch(() => [])
    console.log('\nDrizzle migrations:')
    if (migrations.length === 0) {
      console.log('  (no migrations or table missing)')
    } else {
      for (const m of migrations) {
        console.log(`  - ${m.hash} (id: ${m.id})`)
      }
    }

    await sql.end()
    process.exit(0)
  } catch (error: any) {
    console.error('Database connection error:', error.message)
    await sql.end()
    process.exit(1)
  }
}

main()
