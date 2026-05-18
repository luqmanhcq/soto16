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
    console.log('--- Webinar Attendance Schema Update ---')

    try {
        console.log('Creating webinar_attendances table...')
        await sql`
            CREATE TABLE IF NOT EXISTS "webinar_attendances" (
                "id" serial PRIMARY KEY NOT NULL,
                "user_id" integer NOT NULL,
                "webinar_id" integer NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                CONSTRAINT "webinar_attendances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
                CONSTRAINT "webinar_attendances_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action
            );
        `

        console.log('Adding unique index to webinar_attendances...')
        const indexExists = await sql`
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'webinar_attendances' 
            AND indexname = 'webinar_attendances_user_webinar_idx'
        `
        
        if (indexExists.length === 0) {
            await sql`
                CREATE UNIQUE INDEX "webinar_attendances_user_webinar_idx" ON "webinar_attendances" ("user_id", "webinar_id");
            `
        } else {
            console.log('Index already exists, skipping.')
        }

        console.log('\nDatabase update completed successfully!')
    } catch (error) {
        console.error('Error during database update:', error)
    } finally {
        await sql.end()
    }
}

main()
