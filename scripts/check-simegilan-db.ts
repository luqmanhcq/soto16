import postgres from 'postgres'

// Connect to the simegilan database (same PostgreSQL server, different database)
const sql = postgres('postgresql://postgres:1453@localhost:5432/simegilan', { max: 1 })

async function main() {
  try {
    // List all tables in simegilan database
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
    console.log('=== Tables in simegilan database ===')
    for (const t of tables) {
      console.log(`  ${t.tablename}`)
    }

    // Check sso_tokens table
    try {
      const cols = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'sso_tokens'
        ORDER BY ordinal_position
      `
      console.log('\n=== sso_tokens columns ===')
      if (cols.length === 0) {
        console.log('  (table does not exist)')
      } else {
        for (const c of cols) {
          console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default}`)
        }
      }
    } catch (e: any) {
      console.log('sso_tokens error:', e.message)
    }

    // Check pegawai table columns (first 60)
    try {
      const cols = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'pegawai'
        ORDER BY ordinal_position
        LIMIT 60
      `
      console.log('\n=== pegawai columns ===')
      if (cols.length === 0) {
        console.log('  (table does not exist)')
      } else {
        for (const c of cols) {
          console.log(`  ${c.column_name} (${c.data_type})`)
        }
      }
    } catch (e: any) {
      console.log('pegawai error:', e.message)
    }

    // Count pegawai
    try {
      const count = await sql`SELECT COUNT(*) as total FROM pegawai`
      console.log('\n=== pegawai count ===')
      console.log('  Total:', count[0].total)
    } catch (e: any) {
      console.log('pegawai count error:', e.message)
    }

    // Sample pegawai data
    try {
      const sample = await sql`
        SELECT pegawai_id, nip_baru, nama, gelar_depan, gelar_belakang,
               gol_ruang, jabatan, nmsatker, tipe_pegawai_id,
               status_pegawai_id, opd, sub_opd, email
        FROM pegawai
        LIMIT 3
      `
      console.log('\n=== pegawai sample ===')
      console.log(JSON.stringify(sample, null, 2))
    } catch (e: any) {
      console.log('pegawai sample error:', e.message)
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
