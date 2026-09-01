CREATE TABLE IF NOT EXISTS "manajemen_pengetahuan" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"kategori" varchar(100),
	"deskripsi" text,
	"jumlah_jp" integer,
	"gambar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "manajemen_pengetahuan_slug_unique" UNIQUE ("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mp_materi" (
	"id" serial PRIMARY KEY NOT NULL,
	"manajemen_pengetahuan_id" integer NOT NULL,
	"nama" varchar(255) NOT NULL,
	"urutan" integer NOT NULL,
	"tipe" varchar(20) DEFAULT 'video',
	"link_file" text,
	"link_video" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'mp_materi_manajemen_pengetahuan_id_idx') THEN
  CREATE INDEX "mp_materi_manajemen_pengetahuan_id_idx" ON "mp_materi" ("manajemen_pengetahuan_id");
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mp_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"manajemen_pengetahuan_id" integer NOT NULL,
	"status" "pembelajaran_status" DEFAULT 'belum_mulai' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"current_materi_id" integer,
	"tanggal_selesai" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mp_progress_user_manajemen_pengetahuan_idx" UNIQUE ("user_id","manajemen_pengetahuan_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mp_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"manajemen_pengetahuan_id" integer NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'aktif' NOT NULL,
	CONSTRAINT "mp_participants_user_manajemen_pengetahuan_idx" UNIQUE ("user_id","manajemen_pengetahuan_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mp_materi" ADD CONSTRAINT "mp_materi_manajemen_pengetahuan_id_manajemen_pengetahuan_id_fk" FOREIGN KEY ("manajemen_pengetahuan_id") REFERENCES "public"."manajemen_pengetahuan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mp_progress" ADD CONSTRAINT "mp_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mp_progress" ADD CONSTRAINT "mp_progress_manajemen_pengetahuan_id_manajemen_pengetahuan_id_fk" FOREIGN KEY ("manajemen_pengetahuan_id") REFERENCES "public"."manajemen_pengetahuan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mp_participants" ADD CONSTRAINT "mp_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mp_participants" ADD CONSTRAINT "mp_participants_manajemen_pengetahuan_id_manajemen_pengetahuan_id_fk" FOREIGN KEY ("manajemen_pengetahuan_id") REFERENCES "public"."manajemen_pengetahuan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
