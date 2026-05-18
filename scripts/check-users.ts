import postgres from 'postgres'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const DATABASE_URL = process.env.DATABASE_URL
const sql = postgres(DATABASE_URL!)

async function main() {
    console.log('--- Checking User Existence ---')
    try {
        const users = await sql`SELECT id, nama, email FROM users`
        console.log('Total Users:', users.length)
        users.forEach(u => console.log(`- ID: ${u.id}, Name: ${u.nama}, Email: ${u.email}`))
    } catch (e) {
        console.error(e)
    } finally {
        await sql.end()
    }
}

main()
