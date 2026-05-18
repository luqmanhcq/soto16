import postgres from 'postgres'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const DATABASE_URL = process.env.DATABASE_URL
const sql = postgres(DATABASE_URL!)

async function main() {
    console.log('--- Checking Participants for Webinar ID 4 ---')
    try {
        const participants = await sql`
            SELECT p.*, u.nama, u.email 
            FROM webinar_participants p
            JOIN users u ON p.user_id = u.id
            WHERE p.webinar_id = 4
        `
        
        if (participants.length === 0) {
            console.log('No participants registered for webinar ID 4 yet.')
        } else {
            console.log(`Found ${participants.length} participants:`)
            participants.forEach(p => {
                console.log(`- ${p.nama} (${p.email})`)
            })
        }
    } catch (e) {
        console.error(e)
    } finally {
        await sql.end()
    }
}

main()
