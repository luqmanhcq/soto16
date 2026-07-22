-- SI-SOTO Database Schema (Standard PostgreSQL)
-- Compatible with PostgreSQL 9.3+
-- This file recreates the full schema from scratch.
-- For programmatic initialization, use: npm run db:init

-- ENUM Types
DO $$ BEGIN
 CREATE TYPE "public"."pembelajaran_status" AS ENUM('belum_mulai', 'proses', 'selesai');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."sertifikat_status" AS ENUM('diajukan', 'disetujui', 'ditolak');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('asn', 'admin', 'super_admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."webinar_status" AS ENUM('draft', 'publish', 'selesai');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."webinar_question_type" AS ENUM('post_test', 'monev');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "users" (
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
);

CREATE TABLE IF NOT EXISTS "webinars" (
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
	"link_daftar" text,
	"link_zoom" text,
	"link_youtube" text,
	"link_materi" text,
	"link_post_test" text,
	"link_monev" text,
	"link_sertifikat" text,
	"template_sertifikat" text,
	"sertifikat_config" text,
	"gambar" text,
	"status" "webinar_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webinars_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "webinar_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"webinar_id" integer NOT NULL,
	"nomor_sertifikat" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pembelajaran" (
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
);

CREATE TABLE IF NOT EXISTS "materi" (
	"id" serial PRIMARY KEY NOT NULL,
	"pembelajaran_id" integer NOT NULL,
	"nama" varchar(255) NOT NULL,
	"urutan" integer NOT NULL,
	"link_file" text,
	"link_video" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pembelajaran_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pembelajaran_id" integer NOT NULL,
	"status" "pembelajaran_status" DEFAULT 'belum_mulai' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"tanggal_selesai" timestamp,
	"current_materi_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sertifikat_usulan" (
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
);

CREATE TABLE IF NOT EXISTS "pengumuman" (
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
);

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

CREATE TABLE IF NOT EXISTS "webinar_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"webinar_id" integer NOT NULL,
	"type" "webinar_question_type" NOT NULL,
	"question_text" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "webinar_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "webinar_user_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"webinar_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"type" "webinar_question_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "webinar_attendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"webinar_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign Keys
DO $$ BEGIN
 ALTER TABLE "materi" ADD CONSTRAINT "materi_pembelajaran_id_pembelajaran_id_fk" FOREIGN KEY ("pembelajaran_id") REFERENCES "public"."pembelajaran"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pembelajaran_progress" ADD CONSTRAINT "pembelajaran_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pembelajaran_progress" ADD CONSTRAINT "pembelajaran_progress_pembelajaran_id_pembelajaran_id_fk" FOREIGN KEY ("pembelajaran_id") REFERENCES "public"."pembelajaran"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "sertifikat_usulan" ADD CONSTRAINT "sertifikat_usulan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_participants" ADD CONSTRAINT "webinar_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_participants" ADD CONSTRAINT "webinar_participants_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_attendances" ADD CONSTRAINT "webinar_attendances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_attendances" ADD CONSTRAINT "webinar_attendances_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_options" ADD CONSTRAINT "webinar_options_question_id_webinar_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."webinar_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_questions" ADD CONSTRAINT "webinar_questions_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_question_id_webinar_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."webinar_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_option_id_webinar_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."webinar_options"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Indexes (PG 9.3 compatible: no IF NOT EXISTS on CREATE INDEX)
DO $$ BEGIN CREATE INDEX "materi_pembelajaran_id_idx" ON "materi" USING btree ("pembelajaran_id"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX "pembelajaran_progress_user_pembelajaran_idx" ON "pembelajaran_progress" USING btree ("user_id","pembelajaran_id"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX "pembelajaran_slug_idx" ON "pembelajaran" USING btree ("slug"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX "pengumuman_slug_idx" ON "pengumuman" USING btree ("slug"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE INDEX "sertifikat_usulan_user_id_idx" ON "sertifikat_usulan" USING btree ("user_id"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX "users_nip_idx" ON "users" USING btree ("nip"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX "webinar_participants_user_webinar_idx" ON "webinar_participants" USING btree ("user_id","webinar_id"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX "webinars_slug_idx" ON "webinars" USING btree ("slug"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX "webinar_attendances_user_webinar_idx" ON "webinar_attendances" USING btree ("user_id","webinar_id"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE INDEX "webinar_options_question_id_idx" ON "webinar_options" USING btree ("question_id"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE INDEX "webinar_questions_webinar_id_idx" ON "webinar_questions" USING btree ("webinar_id"); EXCEPTION WHEN duplicate_table THEN null; END $$;
DO $$ BEGIN CREATE INDEX "webinar_user_answers_user_webinar_idx" ON "webinar_user_answers" USING btree ("user_id","webinar_id"); EXCEPTION WHEN duplicate_table THEN null; END $$;
-- SI-SOTO Database Schema (Standard PostgreSQL)
-- Generated for manual execution

-- ENUM Types
DO $$ BEGIN
 CREATE TYPE "public"."pembelajaran_status" AS ENUM('belum_mulai', 'proses', 'selesai');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."sertifikat_status" AS ENUM('diajukan', 'disetujui', 'ditolak');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('asn', 'admin', 'super_admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

END $$;

DO $$ BEGIN
 CREATE TYPE "public"."webinar_status" AS ENUM('draft', 'publish', 'selesai');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "users" (
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
);

CREATE TABLE IF NOT EXISTS "webinars" (
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
	"link_daftar" text,
	"link_zoom" text,
	"link_youtube" text,
	"link_materi" text,
	"link_post_test" text,
	"link_monev" text,
	"link_sertifikat" text,
	"template_sertifikat" text,
	"sertifikat_config" text,
	"gambar" text,
	"status" "webinar_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webinars_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "webinar_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"webinar_id" integer NOT NULL,
	"nomor_sertifikat" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pembelajaran" (
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
);

CREATE TABLE IF NOT EXISTS "materi" (
	"id" serial PRIMARY KEY NOT NULL,
	"pembelajaran_id" integer NOT NULL,
	"nama" varchar(255) NOT NULL,
	"urutan" integer NOT NULL,
	"link_file" text,
	"link_video" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pembelajaran_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pembelajaran_id" integer NOT NULL,
	"status" "pembelajaran_status" DEFAULT 'belum_mulai' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"tanggal_selesai" timestamp,
	"current_materi_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sertifikat_usulan" (
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
);

CREATE TABLE IF NOT EXISTS "pengumuman" (
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
);

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

-- Foreign Keys
DO $$ BEGIN
 ALTER TABLE "materi" ADD CONSTRAINT "materi_pembelajaran_id_pembelajaran_id_fk" FOREIGN KEY ("pembelajaran_id") REFERENCES "public"."pembelajaran"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pembelajaran_progress" ADD CONSTRAINT "pembelajaran_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pembelajaran_progress" ADD CONSTRAINT "pembelajaran_progress_pembelajaran_id_pembelajaran_id_fk" FOREIGN KEY ("pembelajaran_id") REFERENCES "public"."pembelajaran"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "sertifikat_usulan" ADD CONSTRAINT "sertifikat_usulan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_participants" ADD CONSTRAINT "webinar_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "webinar_participants" ADD CONSTRAINT "webinar_participants_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "materi_pembelajaran_id_idx" ON "materi" USING btree ("pembelajaran_id");
CREATE UNIQUE INDEX IF NOT EXISTS "pembelajaran_progress_user_pembelajaran_idx" ON "pembelajaran_progress" USING btree ("user_id","pembelajaran_id");
CREATE UNIQUE INDEX IF NOT EXISTS "pembelajaran_slug_idx" ON "pembelajaran" USING btree ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "pengumuman_slug_idx" ON "pengumuman" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "sertifikat_usulan_user_id_idx" ON "sertifikat_usulan" USING btree ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_nip_idx" ON "users" USING btree ("nip");
CREATE UNIQUE INDEX IF NOT EXISTS "webinar_participants_user_webinar_idx" ON "webinar_participants" USING btree ("user_id","webinar_id");
CREATE UNIQUE INDEX IF NOT EXISTS "webinars_slug_idx" ON "webinars" USING btree ("slug");
