import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function migrate() {
    console.log('Running webinar schema migration...')
    
    try {
        // Change tanggal_mulai from timestamp to date
        await sql`
            ALTER TABLE "webinars" ALTER COLUMN "tanggal_mulai" SET DATA TYPE date 
            USING tanggal_mulai::date
        `
        console.log('✓ Changed tanggal_mulai to date')
    } catch (e: any) {
        if (e.message.includes('already') || e.message.includes('exists')) {
            console.log('  (tanggal_mulai already date or skipped)')
        } else {
            console.error('  Error:', e.message)
        }
    }

    try {
        // Change tanggal_selesai from timestamp to date
        await sql`
            ALTER TABLE "webinars" ALTER COLUMN "tanggal_selesai" SET DATA TYPE date 
            USING tanggal_selesai::date
        `
        console.log('✓ Changed tanggal_selesai to date')
    } catch (e: any) {
        if (e.message.includes('already') || e.message.includes('exists')) {
            console.log('  (tanggal_selesai already date or skipped)')
        } else {
            console.error('  Error:', e.message)
        }
    }

    try {
        // Drop link_daftar column if exists
        await sql`ALTER TABLE "webinars" DROP COLUMN IF EXISTS "link_daftar"`
        console.log('✓ Dropped link_daftar column')
    } catch (e: any) {
        console.error('  Error dropping link_daftar:', e.message)
    }

    try {
        // Drop link_sertifikat column if exists
        await sql`ALTER TABLE "webinars" DROP COLUMN IF EXISTS "link_sertifikat"`
        console.log('✓ Dropped link_sertifikat column')
    } catch (e: any) {
        console.error('  Error dropping link_sertifikat:', e.message)
    }

    console.log('\nMigration completed!')
    await sql.end()
}

migrate().catch(console.error)
