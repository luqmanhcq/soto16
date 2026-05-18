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
    console.log('--- Database Fix Script ---')

    try {
        // 1. Create Carousels Table
        console.log('Checking/Creating carousels table...')
        await sql`
            CREATE TABLE IF NOT EXISTS "carousels" (
                "id" serial PRIMARY KEY NOT NULL,
                "title" varchar(255) NOT NULL,
                "subtitle" text,
                "image" text NOT NULL,
                "link" text,
                "cta_text" varchar(50) DEFAULT 'Lihat Detail',
                "is_active" boolean DEFAULT true NOT NULL,
                "order" integer DEFAULT 0 NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );
        `
        console.log('✓ Carousels table is ready.')

        // 2. Remove jenis_webinar if it still exists (Cleanup)
        console.log('Checking for jenis_webinar column removal...')
        try {
            await sql`ALTER TABLE webinars DROP COLUMN IF EXISTS jenis_webinar;`
            await sql`DROP TYPE IF EXISTS webinar_jenis;`
            console.log('✓ jenis_webinar cleanup done.')
        } catch (e) {
            console.log('- webinars table might not exist or jenis_webinar already removed.')
        }

        console.log('\nDatabase synchronization completed successfully!')
    } catch (error) {
        console.error('Error during database fix:', error)
    } finally {
        await sql.end()
    }
}

main()
