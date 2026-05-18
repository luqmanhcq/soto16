import postgres from 'postgres'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const DATABASE_URL = process.env.DATABASE_URL
const sql = postgres(DATABASE_URL!)

async function main() {
    console.log('--- Current Database Tables ---')
    try {
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `
        console.log(tables.map(t => t.table_name).join(', '))
        
        console.log('\n--- Checking Carousels specifically ---')
        const check = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'carousels'
            )
        `
        console.log('Carousels table exists:', check[0].exists)
    } catch (e) {
        console.error(e)
    } finally {
        await sql.end()
    }
}

main()
