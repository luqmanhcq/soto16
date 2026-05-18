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
    console.log('--- Database Verification & Force Create ---')
    
    try {
        const dbNameRes = await sql`SELECT current_database()`
        console.log('Connected to Database:', dbNameRes[0].current_database)

        console.log('Force creating "carousels" table...')
        await sql`
            CREATE TABLE IF NOT EXISTS carousels (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle TEXT,
                image TEXT NOT NULL,
                link TEXT,
                cta_text VARCHAR(50) DEFAULT 'Lihat Detail',
                is_active BOOLEAN DEFAULT true NOT NULL,
                "order" INTEGER DEFAULT 0 NOT NULL,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            );
        `
        console.log('✓ Table "carousels" ensured.')

        // Test insert
        console.log('Testing insert...')
        const test = await sql`
            INSERT INTO carousels (title, image) 
            VALUES ('Test Carousel', 'https://via.placeholder.com/150') 
            RETURNING id
        `
        console.log('✓ Insert successful, test ID:', test[0].id)

        // Cleanup test
        await sql`DELETE FROM carousels WHERE id = ${test[0].id}`
        console.log('✓ Cleanup successful.')

    } catch (error) {
        console.error('FAILED:', error)
    } finally {
        await sql.end()
    }
}

main()
