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
    console.log('--- FINAL DATABASE SYNCHRONIZATION ---')

    try {
        // 1. Create Carousels Table
        console.log('1. Checking/Creating "carousels" table...')
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

        // 2. Check & Add Kategori to Pengumuman
        console.log('2. Checking "kategori" column in "pengumuman" table...')
        const pengumumanCols = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'pengumuman' AND column_name = 'kategori'
        `
        if (pengumumanCols.length === 0) {
            console.log('Adding "kategori" column to "pengumuman"...')
            await sql`ALTER TABLE pengumuman ADD COLUMN "kategori" varchar(100) DEFAULT 'PENGUMUMAN/INFORMASI LAINNYA' NOT NULL;`
            console.log('✓ Kategori column added.')
        } else {
            console.log('✓ Kategori column already exists.')
        }

        // 3. Cleanup: Remove jenis_webinar from webinars
        console.log('3. Checking "jenis_webinar" column in "webinars" table...')
        const webinarsCols = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'webinars' AND column_name = 'jenis_webinar'
        `
        if (webinarsCols.length > 0) {
            console.log('Removing "jenis_webinar" column from "webinars"...')
            await sql`ALTER TABLE webinars DROP COLUMN "jenis_webinar";`
            await sql`DROP TYPE IF EXISTS webinar_jenis;`
            console.log('✓ jenis_webinar removed.')
        } else {
            console.log('✓ jenis_webinar already removed.')
        }

        console.log('\n--- ALL DATABASE UPDATES COMPLETED SUCCESSFULLY ---')
    } catch (error) {
        console.error('Critical Error during database sync:', error)
    } finally {
        await sql.end()
    }
}

main()
