import { db } from '@/lib/db'
import { pembelajaranSertifikatTable } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export class PembelajaranSertifikatRepository {
    async create(data: {
        user_id: number
        pembelajaran_id: number
        nip: string
        nama: string
        jabatan?: string
        unit_kerja?: string
        nama_pembelajaran: string
        jumlah_jp?: number
        pre_test_score?: number
        post_test_score?: number
        nomor_sertifikat: string
        file_sertifikat?: string
    }) {
        const result = await db.insert(pembelajaranSertifikatTable).values(data).returning()
        return result[0]
    }

    async getByUserAndPembelajaran(userId: number, pembelajaranId: number) {
        const result = await db.select().from(pembelajaranSertifikatTable).where(
            and(
                eq(pembelajaranSertifikatTable.user_id, userId),
                eq(pembelajaranSertifikatTable.pembelajaran_id, pembelajaranId)
            )
        ).limit(1)
        return result[0] || null
    }

    async getByPembelajaran(pembelajaranId: number) {
        return await db.select().from(pembelajaranSertifikatTable).where(
            eq(pembelajaranSertifikatTable.pembelajaran_id, pembelajaranId)
        ).orderBy(desc(pembelajaranSertifikatTable.created_at))
    }

    async getByNomor(nomor: string) {
        const result = await db.select().from(pembelajaranSertifikatTable).where(
            eq(pembelajaranSertifikatTable.nomor_sertifikat, nomor)
        ).limit(1)
        return result[0] || null
    }

    async updateFilePath(id: number, filePath: string) {
        const result = await db.update(pembelajaranSertifikatTable)
            .set({ file_sertifikat: filePath, updated_at: new Date() })
            .where(eq(pembelajaranSertifikatTable.id, id))
            .returning()
        return result[0] || null
    }
}

export const pembelajaranSertifikatRepository = new PembelajaranSertifikatRepository()