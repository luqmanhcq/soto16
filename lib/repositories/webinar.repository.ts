import { db } from '@/lib/db'
import { webinarsTable, webinarParticipantsTable, webinarUserAnswersTable, webinarQuestionsTable } from '@/lib/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import { CreateWebinarDto, UpdateWebinarDto } from '@/lib/validations/webinar.validation'

export type Webinar = typeof webinarsTable.$inferSelect

export class WebinarRepository {
    async getAll(filters?: { kategori?: string; status?: 'draft' | 'publish' | 'selesai' }, limit?: number) {
        return await db.query.webinarsTable.findMany({
            where: (webinars, { eq, and }) => {
                const conditions = []
                if (filters?.kategori) conditions.push(eq(webinars.kategori, filters.kategori))
                if (filters?.status) conditions.push(eq(webinars.status, filters.status))
                return conditions.length > 0 ? and(...conditions) : undefined
            },
            orderBy: [desc(webinarsTable.created_at)],
            limit: limit,
        })
    }

    async findById(id: number): Promise<Webinar | null> {
        const result = await db.query.webinarsTable.findFirst({
            where: eq(webinarsTable.id, id),
        })
        return result || null
    }

    async findBySlug(slug: string): Promise<Webinar | null> {
        const result = await db.query.webinarsTable.findFirst({
            where: eq(webinarsTable.slug, slug),
        })
        return result || null
    }

    async create(data: CreateWebinarDto): Promise<Webinar> {
        const insertData = {
            ...data,
            tanggal_mulai: data.tanggal_mulai ? new Date(data.tanggal_mulai) : null,
            tanggal_selesai: data.tanggal_selesai ? new Date(data.tanggal_selesai) : null,
        }
        const result = await db
            .insert(webinarsTable)
            .values(insertData as any)
            .returning()

        return result[0]
    }

    async update(id: number, data: UpdateWebinarDto): Promise<Webinar | null> {
        const updateData: any = {
            ...data,
            updated_at: new Date(),
        }

        if (data.tanggal_mulai !== undefined) {
            updateData.tanggal_mulai = data.tanggal_mulai ? new Date(data.tanggal_mulai) : null
        }
        if (data.tanggal_selesai !== undefined) {
            updateData.tanggal_selesai = data.tanggal_selesai ? new Date(data.tanggal_selesai) : null
        }

        const result = await db
            .update(webinarsTable)
            .set(updateData)
            .where(eq(webinarsTable.id, id))
            .returning()

        return result[0] || null
    }

    async delete(id: number): Promise<Webinar | null> {
        const result = await db
            .delete(webinarsTable)
            .where(eq(webinarsTable.id, id))
            .returning()

        return result[0] || null
    }

    async join(webinarId: number, userId: number) {
        const result = await db
            .insert(webinarParticipantsTable)
            .values({
                webinar_id: webinarId,
                user_id: userId,
                created_at: new Date(),
            })
            .returning()
        return result[0]
    }

    async countParticipants(webinarId: number): Promise<number> {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(webinarParticipantsTable)
            .where(eq(webinarParticipantsTable.webinar_id, webinarId))
        
        return Number(result[0]?.count || 0)
    }

    async isJoined(webinarId: number, userId: number) {
        const result = await db.query.webinarParticipantsTable.findFirst({
            where: and(
                eq(webinarParticipantsTable.webinar_id, webinarId),
                eq(webinarParticipantsTable.user_id, userId)
            ),
        })
        return !!result
    }

    async getParticipants(webinarId: number) {
        return await db.query.webinarParticipantsTable.findMany({
            where: eq(webinarParticipantsTable.webinar_id, webinarId),
            with: {
                user: true,
            } as any,
        })
    }

    async getUserCompletionStatus(webinarId: number, userId: number) {
        // Check if user has answered post-test questions
        const postTestAnswers = await db.query.webinarUserAnswersTable.findMany({
            where: and(
                eq(webinarUserAnswersTable.user_id, userId),
                eq(webinarUserAnswersTable.webinar_id, webinarId),
                eq(webinarUserAnswersTable.type, 'post_test')
            ),
        })

        // Check if user has answered monev questions
        const monevAnswers = await db.query.webinarUserAnswersTable.findMany({
            where: and(
                eq(webinarUserAnswersTable.user_id, userId),
                eq(webinarUserAnswersTable.webinar_id, webinarId),
                eq(webinarUserAnswersTable.type, 'monev')
            ),
        })

        // Check if webinar has post-test and monev questions
        const questions = await db.query.webinarQuestionsTable.findMany({
            where: eq(webinarQuestionsTable.webinar_id, webinarId),
        })

        const hasPostTestQuestions = questions.some(q => q.type === 'post_test')
        const hasMonevQuestions = questions.some(q => q.type === 'monev')

        return {
            hasPostTest: !hasPostTestQuestions || postTestAnswers.length > 0,
            hasMonev: !hasMonevQuestions || monevAnswers.length > 0,
        }
    }
}

export const webinarRepository = new WebinarRepository()
