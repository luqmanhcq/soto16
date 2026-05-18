import postgres from 'postgres'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const DATABASE_URL = process.env.DATABASE_URL
const sql = postgres(DATABASE_URL!)

async function main() {
    console.log('--- Database Diagnostics for Join Issue ---')
    try {
        const users = await sql`SELECT id, nama, email FROM users LIMIT 1`
        if (users.length === 0) {
            console.log('NO USERS FOUND.')
            return
        }
        const user = users[0]
        console.log('Using User:', user.nama, '(ID:', user.id, ')')

        const webinarId = 3
        const webinar = await sql`SELECT * FROM webinars WHERE id = ${webinarId}`
        if (webinar.length === 0) {
            console.log('Webinar 3 NOT FOUND.')
            return
        }
        console.log('Webinar 3 Status:', webinar[0].status)
        console.log('Webinar 3 Kuota:', webinar[0].kuota)

        // Try to join
        console.log('Testing join for User ID', user.id, 'to Webinar ID', webinarId)
        try {
            const join = await sql`
                INSERT INTO webinar_participants (user_id, webinar_id) 
                VALUES (${user.id}, ${webinarId}) 
                RETURNING id
            `
            console.log('✓ JOIN SUCCESSFUL, ID:', join[0].id)
            // Cleanup
            await sql`DELETE FROM webinar_participants WHERE id = ${join[0].id}`
        } catch (e: any) {
            console.log('X JOIN FAILED:', e.message)
            if (e.code === '23505') {
                console.log('Reason: Already joined (Unique Constraint)')
            }
        }

    } catch (e) {
        console.error(e)
    } finally {
        await sql.end()
    }
}

main()
