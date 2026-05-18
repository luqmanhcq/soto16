import postgres from 'postgres'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const DATABASE_URL = process.env.DATABASE_URL
const sql = postgres(DATABASE_URL!)

async function main() {
    console.log('--- Checking Webinar ID 4 ---')
    try {
        const result = await sql`SELECT * FROM webinars WHERE id = 4`
        if (result.length === 0) {
            console.log('Webinar ID 4 not found.')
        } else {
            console.log('Webinar Found:')
            console.log('Nama:', result[0].nama_webinar)
            console.log('Status:', result[0].status)
            console.log('Kuota:', result[0].kuota)
            
            const participants = await sql`SELECT count(*) FROM webinar_participants WHERE webinar_id = 4`
            console.log('Participants Count:', participants[0].count)
        }
    } catch (e) {
        console.error(e)
    } finally {
        await sql.end()
    }
}

main()
