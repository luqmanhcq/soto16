import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function migrate() {
    console.log('Running pembelajaran questions migration...')

    // 1. Create enum type
    try {
        await sql`CREATE TYPE "pembelajaran_question_type" AS ENUM ('pre_test', 'post_test', 'monev')`
        console.log('✓ Created pembelajaran_question_type enum')
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            console.log('  (enum already exists)')
        } else {
            console.error('  Error:', e.message)
        }
    }

    // 2. Add tipe column to materi table
    try {
        await sql`ALTER TABLE "materi" ADD COLUMN "tipe" varchar(20) DEFAULT 'video'`
        console.log('✓ Added tipe column to materi')
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            console.log('  (tipe column already exists)')
        } else {
            console.error('  Error:', e.message)
        }
    }

    // 3. Create pembelajaran_questions table
    try {
        await sql`
            CREATE TABLE "pembelajaran_questions" (
                "id" serial PRIMARY KEY,
                "pembelajaran_id" integer NOT NULL,
                "type" "pembelajaran_question_type" NOT NULL,
                "question_text" text NOT NULL,
                "order" integer DEFAULT 0 NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            )
        `
        console.log('✓ Created pembelajaran_questions table')
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            console.log('  (pembelajaran_questions already exists)')
        } else {
            console.error('  Error:', e.message)
        }
    }

    // 4. Create pembelajaran_options table
    try {
        await sql`
            CREATE TABLE "pembelajaran_options" (
                "id" serial PRIMARY KEY,
                "question_id" integer NOT NULL,
                "option_text" text NOT NULL,
                "is_correct" boolean DEFAULT false NOT NULL,
                "order" integer DEFAULT 0 NOT NULL
            )
        `
        console.log('✓ Created pembelajaran_options table')
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            console.log('  (pembelajaran_options already exists)')
        } else {
            console.error('  Error:', e.message)
        }
    }

    // 5. Create pembelajaran_user_answers table
    try {
        await sql`
            CREATE TABLE "pembelajaran_user_answers" (
                "id" serial PRIMARY KEY,
                "user_id" integer NOT NULL,
                "pembelajaran_id" integer NOT NULL,
                "question_id" integer NOT NULL,
                "option_id" integer NOT NULL,
                "type" "pembelajaran_question_type" NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL
            )
        `
        console.log('✓ Created pembelajaran_user_answers table')
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            console.log('  (pembelajaran_user_answers already exists)')
        } else {
            console.error('  Error:', e.message)
        }
    }

    // 6. Add foreign keys and indexes
    try {
        await sql`ALTER TABLE "pembelajaran_questions" ADD CONSTRAINT "pembelajaran_questions_pembelajaran_id_fkey" FOREIGN KEY ("pembelajaran_id") REFERENCES "pembelajaran"("id") ON DELETE CASCADE`
        console.log('✓ Added FK: pembelajaran_questions -> pembelajaran')
    } catch (e: any) {
        console.log('  (FK may already exist):', e.message.substring(0, 60))
    }

    try {
        await sql`CREATE INDEX "pembelajaran_questions_pembelajaran_id_idx" ON "pembelajaran_questions" ("pembelajaran_id")`
        console.log('✓ Created index on pembelajaran_questions.pembelajaran_id')
    } catch (e: any) {
        console.log('  (index may already exist)')
    }

    try {
        await sql`ALTER TABLE "pembelajaran_options" ADD CONSTRAINT "pembelajaran_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "pembelajaran_questions"("id") ON DELETE CASCADE`
        console.log('✓ Added FK: pembelajaran_options -> pembelajaran_questions')
    } catch (e: any) {
        console.log('  (FK may already exist):', e.message.substring(0, 60))
    }

    try {
        await sql`CREATE INDEX "pembelajaran_options_question_id_idx" ON "pembelajaran_options" ("question_id")`
        console.log('✓ Created index on pembelajaran_options.question_id')
    } catch (e: any) {
        console.log('  (index may already exist)')
    }

    try {
        await sql`ALTER TABLE "pembelajaran_user_answers" ADD CONSTRAINT "pembelajaran_user_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`
        await sql`ALTER TABLE "pembelajaran_user_answers" ADD CONSTRAINT "pembelajaran_user_answers_pembelajaran_id_fkey" FOREIGN KEY ("pembelajaran_id") REFERENCES "pembelajaran"("id") ON DELETE CASCADE`
        await sql`ALTER TABLE "pembelajaran_user_answers" ADD CONSTRAINT "pembelajaran_user_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "pembelajaran_questions"("id") ON DELETE CASCADE`
        await sql`ALTER TABLE "pembelajaran_user_answers" ADD CONSTRAINT "pembelajaran_user_answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "pembelajaran_options"("id") ON DELETE CASCADE`
        console.log('✓ Added FKs: pembelajaran_user_answers')
    } catch (e: any) {
        console.log('  (FKs may already exist):', e.message.substring(0, 60))
    }

    try {
        await sql`CREATE INDEX "pembelajaran_user_answers_user_pembelajaran_idx" ON "pembelajaran_user_answers" ("user_id", "pembelajaran_id")`
        console.log('✓ Created composite index on pembelajaran_user_answers')
    } catch (e: any) {
        console.log('  (index may already exist)')
    }

    console.log('\nMigration completed!')
    await sql.end()
}

migrate().catch(console.error)
