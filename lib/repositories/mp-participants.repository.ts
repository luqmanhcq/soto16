import { db } from '@/lib/db'
import { mpParticipantsTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export class MpParticipantsRepository {
    async enroll(userId: number, manajemenPengetahuanId: number) {
        const existing = await this.isEnrolled(userId, manajemenPengetahuanId)
        if (existing) return existing

        const result = await db
            .insert(mpParticipantsTable)
            .values({
                user_id: userId,
                manajemen_pengetahuan_id: manajemenPengetahuanId,
            })
            .returning()
        return result[0]
    }

    async isEnrolled(userId: number, manajemenPengetahuanId: number): Promise<boolean> {
        const result = await db.query.mpParticipantsTable.findFirst({
            where: (mp, { eq, and }) => and(eq(mp.user_id, userId), eq(mp.manajemen_pengetahuan_id, manajemenPengetahuanId)),
        })
        return !!result
    }

    async getRecapByMp(manajemenPengetahuanId: number) {
        return await db.query.mpParticipantsTable.findMany({
            where: eq(mpParticipantsTable.manajemen_pengetahuan_id, manajemenPengetahuanId),
            with: {
                user: true,
            },
            orderBy: (mp, { asc }) => [asc(mp.enrolled_at)],
        })
    }
}

export const mpParticipantsRepository = new MpParticipantsRepository()