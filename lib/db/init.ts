import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { max: 1 })

async function main() {
  console.log('Initializing database schema (PostgreSQL 9.3 compatible)...')

  // ============================================================
  // STEP 1: Drop all existing tables and types (clean slate)
  // ============================================================
  console.log('Step 1: Cleaning up existing schema...')

  await sql`DROP TABLE IF EXISTS "webinar_user_answers" CASCADE`
  await sql`DROP TABLE IF EXISTS "webinar_options" CASCADE`
  await sql`DROP TABLE IF EXISTS "webinar_questions" CASCADE`
  await sql`DROP TABLE IF EXISTS "webinar_attendances" CASCADE`
  await sql`DROP TABLE IF EXISTS "webinar_participants" CASCADE`
  await sql`DROP TABLE IF EXISTS "pembelajaran_progress" CASCADE`
  await sql`DROP TABLE IF EXISTS "materi" CASCADE`
  await sql`DROP TABLE IF EXISTS "pembelajaran" CASCADE`
  await sql`DROP TABLE IF EXISTS "sertifikat_usulan" CASCADE`
  await sql`DROP TABLE IF EXISTS "pengumuman" CASCADE`
  await sql`DROP TABLE IF EXISTS "carousels" CASCADE`
  await sql`DROP TABLE IF EXISTS "webinars" CASCADE`
  await sql`DROP TABLE IF EXISTS "users" CASCADE`

  await sql`DROP TYPE IF EXISTS "user_role"`
  await sql`DROP TYPE IF EXISTS "webinar_status"`
  await sql`DROP TYPE IF EXISTS "sertifikat_status"`
  await sql`DROP TYPE IF EXISTS "pembelajaran_status"`
  await sql`DROP TYPE IF EXISTS "webinar_question_type"`
  await sql`DROP TYPE IF EXISTS "webinar_jenis"`

  await sql`DROP SCHEMA IF EXISTS "drizzle" CASCADE`
  console.log('  Done.')

  // ============================================================
  // STEP 2: Create ENUM types
  // ============================================================
  console.log('Step 2: Creating enum types...')

  await sql`CREATE TYPE "user_role" AS ENUM('asn', 'admin', 'super_admin')`
  await sql`CREATE TYPE "webinar_status" AS ENUM('draft', 'publish', 'selesai')`
  await sql`CREATE TYPE "sertifikat_status" AS ENUM('diajukan', 'disetujui', 'ditolak')`
  await sql`CREATE TYPE "pembelajaran_status" AS ENUM('belum_mulai', 'proses', 'selesai')`
  await sql`CREATE TYPE "webinar_question_type" AS ENUM('post_test', 'monev')`
  console.log('  Done.')

  // ============================================================
  // STEP 3: Create tables
  // ============================================================
  console.log('Step 3: Creating tables...')

  await sql`
    CREATE TABLE "users" (
      "id" serial PRIMARY KEY NOT NULL,
      "nip" varchar(18) NOT NULL,
      "nama" varchar(255) NOT NULL,
      "email" varchar(100) NOT NULL,
      "password" text NOT NULL,
      "jabatan" varchar(100),
      "golongan" varchar(50),
      "unit_kerja" varchar(255),
      "role" "user_role" DEFAULT 'asn' NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "users_nip_unique" UNIQUE("nip"),
      CONSTRAINT "users_email_unique" UNIQUE("email")
    )
  `

  await sql`
    CREATE TABLE "webinars" (
      "id" serial PRIMARY KEY NOT NULL,
      "nama_webinar" varchar(255) NOT NULL,
      "slug" varchar(255) NOT NULL,
      "kategori" varchar(100),
      "deskripsi" text,
      "narasumber" text,
      "jumlah_jp" integer,
      "nilai_min" integer,
      "tanggal_mulai" timestamp,
      "tanggal_selesai" timestamp,
      "kuota" integer,
      "penyelenggara" varchar(255),
      "link_zoom" text,
      "link_youtube" text,
      "link_materi" text,
      "link_post_test" text,
      "link_monev" text,
      "template_sertifikat" text,
      "sertifikat_config" text,
      "gambar" text,
      "status" "webinar_status" DEFAULT 'draft' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "webinars_slug_unique" UNIQUE("slug")
    )
  `

  await sql`
    CREATE TABLE "webinar_participants" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "webinar_id" integer NOT NULL,
      "nomor_sertifikat" varchar(255),
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE "pembelajaran" (
      "id" serial PRIMARY KEY NOT NULL,
      "nama" varchar(255) NOT NULL,
      "slug" varchar(255) NOT NULL,
      "kategori" varchar(100),
      "deskripsi" text,
      "jumlah_jp" integer,
      "gambar" text,
      "link_pretest" text,
      "link_posttest" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "pembelajaran_slug_unique" UNIQUE("slug")
    )
  `

  await sql`
    CREATE TABLE "materi" (
      "id" serial PRIMARY KEY NOT NULL,
      "pembelajaran_id" integer NOT NULL,
      "nama" varchar(255) NOT NULL,
      "urutan" integer NOT NULL,
      "link_file" text,
      "link_video" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE "pembelajaran_progress" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "pembelajaran_id" integer NOT NULL,
      "status" "pembelajaran_status" DEFAULT 'belum_mulai' NOT NULL,
      "progress" integer DEFAULT 0 NOT NULL,
      "tanggal_selesai" timestamp,
      "current_materi_id" integer,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE "sertifikat_usulan" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "nama_diklat" varchar(255) NOT NULL,
      "tanggal_pelaksanaan" date,
      "jumlah_jp" integer,
      "penyelenggara" varchar(255),
      "status" "sertifikat_status" DEFAULT 'diajukan' NOT NULL,
      "file_usulan" text,
      "file_sertifikat" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE "sertifikat_webinar" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "webinar_id" integer NOT NULL,
      "nip" varchar(18) NOT NULL,
      "nama" varchar(255) NOT NULL,
      "jabatan" varchar(100),
      "unit_kerja" varchar(255),
      "nama_webinar" varchar(255) NOT NULL,
      "tanggal_mulai" timestamp,
      "tanggal_selesai" timestamp,
      "jumlah_jp" integer,
      "penyelenggara" varchar(255),
      "nomor_sertifikat" varchar(255) NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE "pengumuman" (
      "id" serial PRIMARY KEY NOT NULL,
      "judul" varchar(255) NOT NULL,
      "slug" varchar(255) NOT NULL,
      "kategori" varchar(100) DEFAULT 'PENGUMUMAN/INFORMASI LAINNYA' NOT NULL,
      "deskripsi" text,
      "gambar" text,
      "link_file" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "pengumuman_slug_unique" UNIQUE("slug")
    )
  `

  await sql`
    CREATE TABLE "carousels" (
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
    )
  `

  await sql`
    CREATE TABLE "webinar_questions" (
      "id" serial PRIMARY KEY NOT NULL,
      "webinar_id" integer NOT NULL,
      "type" "webinar_question_type" NOT NULL,
      "question_text" text NOT NULL,
      "order" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE "webinar_options" (
      "id" serial PRIMARY KEY NOT NULL,
      "question_id" integer NOT NULL,
      "option_text" text NOT NULL,
      "is_correct" boolean DEFAULT false NOT NULL,
      "order" integer DEFAULT 0 NOT NULL
    )
  `

  await sql`
    CREATE TABLE "webinar_user_answers" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "webinar_id" integer NOT NULL,
      "question_id" integer NOT NULL,
      "option_id" integer NOT NULL,
      "type" "webinar_question_type" NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `

  await sql`
    CREATE TABLE "webinar_attendances" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "webinar_id" integer NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `
  console.log('  Done.')

  // ============================================================
  // STEP 4: Create foreign keys
  // ============================================================
  console.log('Step 4: Creating foreign keys...')

  await sql`ALTER TABLE "materi" ADD CONSTRAINT "materi_pembelajaran_id_pembelajaran_id_fk" FOREIGN KEY ("pembelajaran_id") REFERENCES "pembelajaran"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "pembelajaran_progress" ADD CONSTRAINT "pembelajaran_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "pembelajaran_progress" ADD CONSTRAINT "pembelajaran_progress_pembelajaran_id_pembelajaran_id_fk" FOREIGN KEY ("pembelajaran_id") REFERENCES "pembelajaran"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "sertifikat_usulan" ADD CONSTRAINT "sertifikat_usulan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "sertifikat_webinar" ADD CONSTRAINT "sertifikat_webinar_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "sertifikat_webinar" ADD CONSTRAINT "sertifikat_webinar_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "webinars"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_participants" ADD CONSTRAINT "webinar_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_participants" ADD CONSTRAINT "webinar_participants_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "webinars"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_attendances" ADD CONSTRAINT "webinar_attendances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_attendances" ADD CONSTRAINT "webinar_attendances_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "webinars"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_options" ADD CONSTRAINT "webinar_options_question_id_webinar_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "webinar_questions"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_questions" ADD CONSTRAINT "webinar_questions_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "webinars"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "webinars"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_question_id_webinar_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "webinar_questions"("id") ON DELETE cascade ON UPDATE no action`
  await sql`ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_option_id_webinar_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "webinar_options"("id") ON DELETE cascade ON UPDATE no action`
  console.log('  Done.')

  // ============================================================
  // STEP 5: Create indexes (PG 9.3 compatible - no IF NOT EXISTS)
  // ============================================================
  console.log('Step 5: Creating indexes...')

  await sql`CREATE INDEX "materi_pembelajaran_id_idx" ON "materi" USING btree ("pembelajaran_id")`
  await sql`CREATE UNIQUE INDEX "pembelajaran_progress_user_pembelajaran_idx" ON "pembelajaran_progress" USING btree ("user_id","pembelajaran_id")`
  await sql`CREATE UNIQUE INDEX "pembelajaran_slug_idx" ON "pembelajaran" USING btree ("slug")`
  await sql`CREATE UNIQUE INDEX "pengumuman_slug_idx" ON "pengumuman" USING btree ("slug")`
  await sql`CREATE INDEX "sertifikat_usulan_user_id_idx" ON "sertifikat_usulan" USING btree ("user_id")`
  await sql`CREATE UNIQUE INDEX "sertifikat_webinar_user_webinar_idx" ON "sertifikat_webinar" USING btree ("user_id","webinar_id")`
  await sql`CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email")`
  await sql`CREATE UNIQUE INDEX "users_nip_idx" ON "users" USING btree ("nip")`
  await sql`CREATE UNIQUE INDEX "webinar_participants_user_webinar_idx" ON "webinar_participants" USING btree ("user_id","webinar_id")`
  await sql`CREATE UNIQUE INDEX "webinars_slug_idx" ON "webinars" USING btree ("slug")`
  await sql`CREATE UNIQUE INDEX "webinar_attendances_user_webinar_idx" ON "webinar_attendances" USING btree ("user_id","webinar_id")`
  await sql`CREATE INDEX "webinar_options_question_id_idx" ON "webinar_options" USING btree ("question_id")`
  await sql`CREATE INDEX "webinar_questions_webinar_id_idx" ON "webinar_questions" USING btree ("webinar_id")`
  await sql`CREATE INDEX "webinar_user_answers_user_webinar_idx" ON "webinar_user_answers" USING btree ("user_id","webinar_id")`
  console.log('  Done.')

  // ============================================================
  // STEP 6: Create drizzle migrations journal (so drizzle knows migrations are applied)
  // ============================================================
  console.log('Step 6: Creating drizzle migrations journal...')

  await sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`
  await sql`
    CREATE TABLE "drizzle"."__drizzle_migrations" (
      "id" serial PRIMARY KEY,
      "hash" text NOT NULL,
      "created_at" bigint
    )
  `

  // Insert migration records with hashes matching the migration files
  // These hashes are computed by drizzle-kit based on the migration file content
  const crypto = await import('crypto')
  const fs = await import('fs')
  const path = await import('path')

  const migrations = [
    { tag: '0000_naive_wiccan', file: 'drizzle/0000_naive_wiccan.sql' },
    { tag: '0001_typical_prowler', file: 'drizzle/0001_typical_prowler.sql' },
  ]

  for (const migration of migrations) {
    const filePath = path.join(process.cwd(), migration.file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const hash = crypto.createHash('sha256').update(content).digest('hex')
    await sql`INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at") VALUES (${hash}, ${Date.now()})`
    console.log(`  Recorded migration: ${migration.tag} (hash: ${hash.substring(0, 16)}...)`)
  }

  console.log('  Done.')

  // ============================================================
  // DONE
  // ============================================================
  console.log('\n✅ Database schema initialized successfully!')
  console.log('   - 13 tables created')
  console.log('   - 5 enum types created')
  console.log('   - 14 foreign keys created')
  console.log('   - 13 indexes created')
  console.log('   - 2 migration records tracked')

  await sql.end()
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Database initialization failed:', err)
  sql.end()
  process.exit(1)
})
