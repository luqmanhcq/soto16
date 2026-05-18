import postgres from 'postgres'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const DATABASE_URL = process.env.DATABASE_URL
const sql = postgres(DATABASE_URL!)

async function main() {
    console.log('--- FIXING WEBINAR ID 4 FOR REGISTRATION ---')
    try {
        // 1. Update status to publish and increase quota
        console.log('Updating webinar ID 4 status to "publish" and quota to 500...')
        const result = await sql`
            UPDATE webinars 
            SET status = 'publish', 
                kuota = 500,
                updated_at = NOW()
            WHERE id = 4
            RETURNING id, nama_webinar, status, kuota
        `

        if (result.length === 0) {
            console.log('Webinar ID 4 not found. Please make sure the ID is correct.')
        } else {
            console.log('✓ Webinar Updated:', result[0].nama_webinar)
            console.log('New Status:', result[0].status)
            console.log('New Quota:', result[0].kuota)
        }

        // 2. Optional: Check if the user trying to join is already joined
        // We don't have the user ID here, but we ensure the table is ready
        console.log('\nChecking webinar_participants table...')
        await sql`
            CREATE TABLE IF NOT EXISTS webinar_participants (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                webinar_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            );
        `
        console.log('✓ webinar_participants table is ready.')

        console.log('\n--- ALL FIXES APPLIED SUCCESSFULLY ---')
        console.log('Please try to register for the webinar again in the browser.')
    } catch (e) {
        console.error('Critical Error:', e)
    } finally {
        await sql.end()
    }
}

main()
