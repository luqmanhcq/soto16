import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:1453@localhost:5432/sisoto'
const client = postgres(dbUrl)
const db = drizzle(client)

async function main() {
    try {
        console.log('⏳ Menjalankan sinkronisasi database manual...')

        // 1. Tambahkan Enum (jika belum ada)
        try {
            await db.execute(sql`CREATE TYPE "public"."webinar_question_type" AS ENUM('post_test', 'monev');`)
            console.log('✅ Enum webinar_question_type berhasil dibuat')
        } catch (e: any) {
            console.log('⚠️ Enum webinar_question_type mungkin sudah ada')
        }

        // 2. Tambahkan kolom template_sertifikat di webinars
        console.log('Menambahkan kolom template_sertifikat...')
        try {
            await db.execute(sql`ALTER TABLE "webinars" ADD COLUMN "template_sertifikat" text;`)
            console.log('✅ Kolom template_sertifikat siap')
        } catch (e: any) {
            console.log('⚠️ Kolom template_sertifikat mungkin sudah ada')
        }

        // 2.5 Tambahkan kolom sertifikat_config di webinars
        console.log('Menambahkan kolom sertifikat_config...')
        try {
            await db.execute(sql`ALTER TABLE "webinars" ADD COLUMN "sertifikat_config" text;`)
            console.log('✅ Kolom sertifikat_config siap')
        } catch (e: any) {
            console.log('⚠️ Kolom sertifikat_config mungkin sudah ada')
        }

        // 3. Tambahkan kolom nomor_sertifikat di webinar_participants
        console.log('Menambahkan kolom nomor_sertifikat...')
        try {
            await db.execute(sql`ALTER TABLE "webinar_participants" ADD COLUMN "nomor_sertifikat" varchar(255);`)
            console.log('✅ Kolom nomor_sertifikat siap')
        } catch (e: any) {
            console.log('⚠️ Kolom nomor_sertifikat mungkin sudah ada')
        }

        // 4. Ubah tipe tanggal_mulai dan tanggal_selesai menjadi timestamp
        console.log('Mengubah tipe kolom tanggal ke TIMESTAMP...')
        try {
            await db.execute(sql`ALTER TABLE "webinars" ALTER COLUMN "tanggal_mulai" TYPE TIMESTAMP;`)
            await db.execute(sql`ALTER TABLE "webinars" ALTER COLUMN "tanggal_selesai" TYPE TIMESTAMP;`)
            console.log('✅ Tipe kolom tanggal berhasil diubah ke TIMESTAMP')
        } catch (e: any) {
            console.log('⚠️ Gagal mengubah tipe kolom tanggal:', e.message)
        }

        console.log('🎉 Sinkronisasi manual selesai! Anda sudah dapat menjalankan aplikasi.')
        await client.end()
        process.exit(0)
    } catch (error) {
        console.error('❌ Gagal menjalankan sinkronisasi:', error)
        await client.end()
        process.exit(1)
    }
}

main()
