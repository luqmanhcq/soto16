import postgres from 'postgres'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const DATABASE_URL = process.env.DATABASE_URL
const sql = postgres(DATABASE_URL!)

async function main() {
    const webinarId = process.argv[2] ? parseInt(process.argv[2]) : null
    
    if (!webinarId) {
        console.log('Usage: npx tsx scripts/fix-webinar.ts <ID>')
        console.log('Example: npx tsx scripts/fix-webinar.ts 3')
        process.exit(1)
    }

    console.log(`--- FIXING WEBINAR ID ${webinarId} FOR REGISTRATION ---`)
    try {
        // 1. Update status to publish and increase quota
        console.log(`Updating webinar ID ${webinarId} status to "publish" and quota to 1000...`)
        const result = await sql`
            UPDATE webinars 
            SET status = 'publish', 
                kuota = 1000,
                updated_at = NOW()
            WHERE id = ${webinarId}
            RETURNING id, nama_webinar, status, kuota
        `

        if (result.length === 0) {
            console.log(`Webinar ID ${webinarId} not found.`)
        } else {
            console.log('✓ Webinar Updated:', result[0].nama_webinar)
            console.log('New Status:', result[0].status)
            console.log('New Quota:', result[0].kuota)
        }

        console.log('\n--- FIX APPLIED SUCCESSFULLY ---')
    } catch (e) {
        console.error('Critical Error:', e)
    } finally {
        await sql.end()
    }
}

main()
