import { db } from '@/lib/db'
import { pembelajaranParticipantsTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export class PembelajaranParticipantsRepository {
    async enroll(userId: number, pembelajaranId: number) {
        const existing = await this.getEnrollment(userId, pembelajaranId)
        if (existing) return existing

        const result = await db.insert(pembelajaranParticipantsTable).values({
            user_id: userId,
            pembelajaran_id: pembelajaranId,
            status: 'aktif',
        }).returning()
        return result[0]
    }

    async getEnrollment(userId: number, pembelajaranId: number) {
        const result = await db.select().from(pembelajaranParticipantsTable).where(
            and(
                eq(pembelajaranParticipantsTable.user_id, userId),
                eq(pembelajaranParticipantsTable.pembelajaran_id, pembelajaranId)
            )
        ).limit(1)
        return result[0] || null
    }

    async isEnrolled(userId: number, pembelajaranId: number): Promise<boolean> {
        const enrollment = await this.getEnrollment(userId, pembelajaranId)
        return !!enrollment
    }

    async getEnrollmentsByPembelajaran(pembelajaranId: number) {
        return await db.select().from(pembelajaranParticipantsTable).where(
            eq(pembelajaranParticipantsTable.pembelajaran_id, pembelajaranId)
        )
    }
}

export const pembelajaranParticipantsRepository = new PembelajaranParticipantsRepository()