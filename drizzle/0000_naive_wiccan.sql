DO $$ BEGIN
 CREATE TYPE "public"."pembelajaran_status" AS ENUM('belum_mulai', 'proses', 'selesai');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sertifikat_status" AS ENUM('diajukan', 'disetujui', 'ditolak');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('asn', 'admin', 'super_admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."webinar_jenis" AS ENUM('internal', 'external');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."webinar_status" AS ENUM('draft', 'publish', 'selesai');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pengumuman" (
	"id" serial PRIMARY KEY NOT NULL,
	"judul" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"deskripsi" text,
	"gambar" text,
	"link_file" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pengumuman_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webinar_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"webinar_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webinars" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_webinar" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"kategori" varchar(100),
	"deskripsi" text,
	"narasumber" text,
	"jumlah_jp" integer,
	"nilai_min" integer,
	"tanggal_mulai" date,
	"tanggal_selesai" date,
	"kuota" integer,
	"penyelenggara" varchar(255),
	"jenis_webinar" "webinar_jenis" DEFAULT 'external' NOT NULL,
	"link_daftar" text,
	"link_zoom" text,
	"link_youtube" text,
	"link_materi" text,
	"link_post_test" text,
	"link_monev" text,
	"link_sertifikat" text,
	"gambar" text,
	"status" "webinar_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webinars_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "materi" ADD CONSTRAINT "materi_pembelajaran_id_pembelajaran_id_fk" FOREIGN KEY ("pembelajaran_id") REFERENCES "public"."pembelajaran"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pembelajaran_progress" ADD CONSTRAINT "pembelajaran_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pembelajaran_progress" ADD CONSTRAINT "pembelajaran_progress_pembelajaran_id_pembelajaran_id_fk" FOREIGN KEY ("pembelajaran_id") REFERENCES "public"."pembelajaran"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sertifikat_usulan" ADD CONSTRAINT "sertifikat_usulan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webinar_participants" ADD CONSTRAINT "webinar_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webinar_participants" ADD CONSTRAINT "webinar_participants_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "materi_pembelajaran_id_idx" ON "materi" USING btree ("pembelajaran_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pembelajaran_progress_user_pembelajaran_idx" ON "pembelajaran_progress" USING btree ("user_id","pembelajaran_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pembelajaran_slug_idx" ON "pembelajaran" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pengumuman_slug_idx" ON "pengumuman" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sertifikat_usulan_user_id_idx" ON "sertifikat_usulan" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_nip_idx" ON "users" USING btree ("nip");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "webinar_participants_user_webinar_idx" ON "webinar_participants" USING btree ("user_id","webinar_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "webinars_slug_idx" ON "webinars" USING btree ("slug");