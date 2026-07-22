CREATE TYPE "public"."webinar_question_type" AS ENUM('post_test', 'monev');--> statement-breakpoint
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
);
--> statement-breakpoint
CREATE TABLE "webinar_attendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"webinar_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webinar_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webinar_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"webinar_id" integer NOT NULL,
	"type" "webinar_question_type" NOT NULL,
	"question_text" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webinar_user_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"webinar_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"type" "webinar_question_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webinars" ALTER COLUMN "tanggal_mulai" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "webinars" ALTER COLUMN "tanggal_selesai" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "pengumuman" ADD COLUMN "kategori" varchar(100) DEFAULT 'PENGUMUMAN/INFORMASI LAINNYA' NOT NULL;--> statement-breakpoint
ALTER TABLE "webinar_participants" ADD COLUMN "nomor_sertifikat" varchar(255);--> statement-breakpoint
ALTER TABLE "webinars" ADD COLUMN "template_sertifikat" text;--> statement-breakpoint
ALTER TABLE "webinars" ADD COLUMN "sertifikat_config" text;--> statement-breakpoint
ALTER TABLE "webinar_attendances" ADD CONSTRAINT "webinar_attendances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webinar_attendances" ADD CONSTRAINT "webinar_attendances_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webinar_options" ADD CONSTRAINT "webinar_options_question_id_webinar_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."webinar_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webinar_questions" ADD CONSTRAINT "webinar_questions_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_webinar_id_webinars_id_fk" FOREIGN KEY ("webinar_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_question_id_webinar_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."webinar_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webinar_user_answers" ADD CONSTRAINT "webinar_user_answers_option_id_webinar_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."webinar_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "webinar_attendances_user_webinar_idx" ON "webinar_attendances" USING btree ("user_id","webinar_id");--> statement-breakpoint
CREATE INDEX "webinar_options_question_id_idx" ON "webinar_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "webinar_questions_webinar_id_idx" ON "webinar_questions" USING btree ("webinar_id");--> statement-breakpoint
CREATE INDEX "webinar_user_answers_user_webinar_idx" ON "webinar_user_answers" USING btree ("user_id","webinar_id");--> statement-breakpoint
ALTER TABLE "webinars" DROP COLUMN "jenis_webinar";--> statement-breakpoint
DROP TYPE "public"."webinar_jenis";