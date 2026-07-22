import postgres from 'postgres'

const sql = postgres('postgresql://postgres:1453@localhost:5432/simegilan', { max: 1 })

async function main() {
  try {
    // Get distinct column names (no duplicates)
    const cols = await sql`
      SELECT DISTINCT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'pegawai'
      ORDER BY column_name
    `
    console.log('=== pegawai columns (distinct) ===')
    for (const c of cols) {
      console.log(`  ${c.column_name} (${c.data_type})`)
    }

    // Try to get a sample row with key columns
    const sample = await sql`
      SELECT pegawai_id, nip_baru, nama, gelar_depan, gelar_belakang,
             tipe_pegawai_id, status_pegawai, email, satker_id
      FROM pegawai LIMIT 2
    `
    console.log('\n=== sample ===')
    console.log(JSON.stringify(sample, null, 2))

    // Check if there's a satker/nmsatker column
    const satkerCols = await sql`
      SELECT DISTINCT column_name FROM information_schema.columns
      WHERE table_name = 'pegawai' AND column_name ILIKE '%satker%'
    `
    console.log('\n=== satker-related columns ===')
    console.log(JSON.stringify(satkerCols, null, 2))

    // Check if there's a jabatan column
    const jabatanCols = await sql`
      SELECT DISTINCT column_name FROM information_schema.columns
      WHERE table_name = 'pegawai' AND column_name ILIKE '%jabatan%'
    `
    console.log('\n=== jabatan-related columns ===')
    console.log(JSON.stringify(jabatanCols, null, 2))

    // Check if there's an opd column
    const opdCols = await sql`
      SELECT DISTINCT column_name FROM information_schema.columns
      WHERE table_name = 'pegawai' AND column_name ILIKE '%opd%'
    `
    console.log('\n=== opd-related columns ===')
    console.log(JSON.stringify(opdCols, null, 2))

    // Check sso_tokens table
    const ssoTokens = await sql`SELECT * FROM sso_tokens LIMIT 3`
    console.log('\n=== sso_tokens sample ===')
    console.log(JSON.stringify(ssoTokens, null, 2))

    await sql.end()
    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    await sql.end()
    process.exit(1)
  }
}

main()
