DO $$ BEGIN
 CREATE TYPE "public"."webinar_jenis" AS ENUM('internal', 'external');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "webinars" ALTER COLUMN "narasumber" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "webinars" ADD COLUMN "jenis_webinar" "webinar_jenis" DEFAULT 'external' NOT NULL;