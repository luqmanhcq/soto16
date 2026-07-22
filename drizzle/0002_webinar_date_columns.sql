-- Change tanggal_mulai and tanggal_selesai from timestamp to date
ALTER TABLE "webinars" ALTER COLUMN "tanggal_mulai" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "webinars" ALTER COLUMN "tanggal_selesai" SET DATA TYPE date;--> statement-breakpoint
-- Remove unused columns
ALTER TABLE "webinars" DROP COLUMN IF EXISTS "link_daftar";--> statement-breakpoint
ALTER TABLE "webinars" DROP COLUMN IF EXISTS "link_sertifikat";
