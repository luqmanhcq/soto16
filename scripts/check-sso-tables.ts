import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function main() {
  try {
    // Check sso_tokens table
    try {
      const tokens = await sql`SELECT * FROM sso_tokens LIMIT 5`
      console.log('=== sso_tokens data ===')
      console.log(JSON.stringify(tokens, null, 2))
    } catch (e: any) {
      console.log('sso_tokens table:', e.message)
    }

    // Check sso_tokens columns
    try {
      const cols = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'sso_tokens'
        ORDER BY ordinal_position
      `
      console.log('\n=== sso_tokens columns ===')
      for (const c of cols) {
        console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default}`)
      }
    } catch (e: any) {
      console.log('sso_tokens columns error:', e.message)
    }

    // Check pegawai table columns
    try {
      const cols = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'pegawai'
        ORDER BY ordinal_position
        LIMIT 50
      `
      console.log('\n=== pegawai columns ===')
      for (const c of cols) {
        console.log(`  ${c.column_name} (${c.data_type})`)
      }
    } catch (e: any) {
      console.log('pegawai columns error:', e.message)
    }

    // Check pegawai sample data
    try {
      const sample = await sql`
        SELECT pegawai_id, nip_baru, nama, gelar_depan, gelar_belakang,
               gol_ruang, jabatan, nm_satker, tipe_pegawai_id, pegawai_status_id,
               status_pegawai_id, opd, sub_opd, email
        FROM pegawai
        LIMIT 3
      `
      console.log('\n=== pegawai sample ===')
      console.log(JSON.stringify(sample, null, 2))
    } catch (e: any) {
      console.log('pegawai sample error:', e.message)
    }

    // Count pegawai
    try {
      const count = await sql`SELECT COUNT(*) as total FROM pegawai`
      console.log('\n=== pegawai count ===')
      console.log('Total:', count[0].total)
    } catch (e: any) {
      console.log('pegawai count error:', e.message)
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
