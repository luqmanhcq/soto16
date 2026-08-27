import { db } from '@/lib/db'
import { pembelajaranProgressTable, materiTable, pembelajaranTable } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export class ProgressRepository {
    async findByUserIdAndPembelajaranId(userId: number, pembelajaranId: number) {
        const result = await db.query.pembelajaranProgressTable.findFirst({
            where: and(
                eq(pembelajaranProgressTable.user_id, userId),
                eq(pembelajaranProgressTable.pembelajaran_id, pembelajaranId)
            )
        })
        return result || null
    }

    async findByPembelajaranId(pembelajaranId: number) {
        return await db.query.pembelajaranProgressTable.findMany({
            where: eq(pembelajaranProgressTable.pembelajaran_id, pembelajaranId)
        })
    }

    async findByUserId(userId: number) {
        const rows = await db
            .select()
            .from(pembelajaranProgressTable)
            .leftJoin(pembelajaranTable, eq(pembelajaranProgressTable.pembelajaran_id, pembelajaranTable.id))
            .where(eq(pembelajaranProgressTable.user_id, userId))

        return rows.map(row => ({
            ...row.pembelajaran_progress,
            pembelajaran: row.pembelajaran,
        }))
    }

    async upsert(userId: number, pembelajaranId: number, currentMateriId: number | null, progressPercent: number, status: 'belum_mulai' | 'proses' | 'selesai') {
        const existing = await this.findByUserIdAndPembelajaranId(userId, pembelajaranId)

        if (existing) {
            const result = await db
                .update(pembelajaranProgressTable)
                .set({
                    current_materi_id: currentMateriId,
                    progress: progressPercent,
                    status,
                    updated_at: new Date()
                })
                .where(eq(pembelajaranProgressTable.id, existing.id))
                .returning()
            return result[0]
        } else {
            const result = await db
                .insert(pembelajaranProgressTable)
                .values({
                    user_id: userId,
                    pembelajaran_id: pembelajaranId,
                    current_materi_id: currentMateriId,
                    progress: progressPercent,
                    status
                })
                .returning()
            return result[0]
        }
    }

    async getPlayerProgress(userId: number, pembelajaranId: number) {
        return await this.findByUserIdAndPembelajaranId(userId, pembelajaranId)
    }
}

export const progressRepository = new ProgressRepository()
