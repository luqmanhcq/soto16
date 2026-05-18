import postgres from 'postgres'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    console.error('DATABASE_URL not found in .env')
    process.exit(1)
}

const sql = postgres(DATABASE_URL)

async function main() {
    console.log('--- Pengumuman Kategori Update Script (Fixed) ---')

    try {
        // Cek apakah kolom sudah ada
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'pengumuman' AND column_name = 'kategori'
        `

        if (columns.length === 0) {
            console.log('Adding kategori column to pengumuman table...')
            // Gunakan sintaks standar tanpa IF NOT EXISTS jika menyebabkan masalah di versi tertentu
            await sql`
                ALTER TABLE pengumuman 
                ADD COLUMN "kategori" varchar(100) DEFAULT 'PENGUMUMAN/INFORMASI LAINNYA' NOT NULL;
            `
            console.log('✓ Kategori column added successfully.')
        } else {
            console.log('✓ Kategori column already exists.')
        }

        console.log('\nDatabase update completed successfully!')
    } catch (error) {
        console.error('Error during database update:', error)
    } finally {
        await sql.end()
    }
}

main()
