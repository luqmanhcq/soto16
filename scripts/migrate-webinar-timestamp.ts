import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function migrate() {
    console.log('Running webinar timestamp migration...')
    
    try {
        // Change tanggal_mulai from date to timestamp
        await sql`
            ALTER TABLE "webinars" ALTER COLUMN "tanggal_mulai" SET DATA TYPE timestamp 
            USING tanggal_mulai::timestamp
        `
        console.log('✓ Changed tanggal_mulai to timestamp')
    } catch (e: any) {
        if (e.message.includes('already') || e.message.includes('exists')) {
            console.log('  (tanggal_mulai already timestamp or skipped)')
        } else {
            console.error('  Error:', e.message)
        }
    }

    try {
        // Change tanggal_selesai from date to timestamp
        await sql`
            ALTER TABLE "webinars" ALTER COLUMN "tanggal_selesai" SET DATA TYPE timestamp 
            USING tanggal_selesai::timestamp
        `
        console.log('✓ Changed tanggal_selesai to timestamp')
    } catch (e: any) {
        if (e.message.includes('already') || e.message.includes('exists')) {
            console.log('  (tanggal_selesai already timestamp or skipped)')
        } else {
            console.error('  Error:', e.message)
        }
    }

    console.log('\nMigration completed!')
    await sql.end()
}

migrate().catch(console.error)
