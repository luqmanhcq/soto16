import { db } from '@/lib/db'
import { webinarsTable, webinarParticipantsTable } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
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
        const result = await db
            .insert(webinarsTable)
            .values(data as any)
            .returning()

        return result[0]
    }

    async update(id: number, data: UpdateWebinarDto): Promise<Webinar | null> {
        const result = await db
            .update(webinarsTable)
            .set({
                ...data,
                updated_at: new Date(),
            } as any)
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
            })
            .returning()
        return result[0]
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
}

export const webinarRepository = new WebinarRepository()
