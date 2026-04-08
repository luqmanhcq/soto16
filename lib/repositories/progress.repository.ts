import { db } from '@/lib/db'
import { pembelajaranProgressTable, materiTable } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export class ProgressRepository {
    async findProgress(userId: number, pembelajaranId: number) {
        const result = await db.query.pembelajaranProgressTable.findFirst({
            where: and(
                eq(pembelajaranProgressTable.user_id, userId),
                eq(pembelajaranProgressTable.pembelajaran_id, pembelajaranId)
            )
        })
        return result || null
    }

    async upsert(userId: number, pembelajaranId: number, currentMateriId: number, progressPercent: number, status: 'belum_mulai' | 'proses' | 'selesai') {
        const existing = await this.findProgress(userId, pembelajaranId)

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
        return await this.findProgress(userId, pembelajaranId)
    }
}

export const progressRepository = new ProgressRepository()
