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
    console.log('--- Webinar Post-test & Monev Schema Update ---')

    try {
        // 1. Create Enum
        console.log('Creating webinar_question_type enum...')
        await sql`
            DO $$ BEGIN
                CREATE TYPE "public"."webinar_question_type" AS ENUM('post_test', 'monev');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `

        // 2. Create webinar_questions table
        console.log('Creating webinar_questions table...')
        await sql`
            CREATE TABLE IF NOT EXISTS "webinar_questions" (
                "id" serial PRIMARY KEY NOT NULL,
                "webinar_id" integer NOT NULL,
                "type" "webinar_question_type" NOT NULL,
                "question_text" text NOT NULL,
                "order" integer DEFAULT 0 NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL,
                CONSTRAINT "webinar_questions_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action
            );
        `

        // 3. Create webinar_options table
        console.log('Creating webinar_options table...')
        await sql`
            CREATE TABLE IF NOT EXISTS "webinar_options" (
                "id" serial PRIMARY KEY NOT NULL,
                "question_id" integer NOT NULL,
                "option_text" text NOT NULL,
                "is_correct" boolean DEFAULT false NOT NULL,
                "order" integer DEFAULT 0 NOT NULL,
                CONSTRAINT "webinar_options_question_id_webinar_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."webinar_questions"("id") ON DELETE cascade ON UPDATE no action
            );
        `

        // 4. Create webinar_user_answers table
        console.log('Creating webinar_user_answers table...')
        await sql`
            CREATE TABLE IF NOT EXISTS "webinar_user_answers" (
                "id" serial PRIMARY KEY NOT NULL,
                "user_id" integer NOT NULL,
                "webinar_id" integer NOT NULL,
                "question_id" integer NOT NULL,
                "option_id" integer NOT NULL,
                "type" "webinar_question_type" NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                CONSTRAINT "webinar_user_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
                CONSTRAINT "webinar_user_answers_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action,
                CONSTRAINT "webinar_user_answers_question_id_webinar_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."webinar_questions"("id") ON DELETE cascade ON UPDATE no action,
                CONSTRAINT "webinar_user_answers_option_id_webinar_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."webinar_options"("id") ON DELETE cascade ON UPDATE no action
            );
        `

        console.log('\nDatabase update completed successfully!')
    } catch (error) {
        console.error('Error during database update:', error)
    } finally {
        await sql.end()
    }
}

main()
