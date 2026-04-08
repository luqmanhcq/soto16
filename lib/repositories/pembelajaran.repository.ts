import { db } from '@/lib/db'
import { pembelajaranTable } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { CreatePembelajaranDto, UpdatePembelajaranDto } from '@/lib/validations/pembelajaran.validation'

export type Pembelajaran = typeof pembelajaranTable.$inferSelect

export class PembelajaranRepository {
    async getAll(filters?: { kategori?: string }, limit?: number) {
        return await db.query.pembelajaranTable.findMany({
            where: (pembelajaran, { eq }) => {
                return filters?.kategori ? eq(pembelajaran.kategori, filters.kategori) : undefined
            },
            orderBy: [desc(pembelajaranTable.created_at)],
            limit: limit,
        })
    }

    async findById(id: number): Promise<Pembelajaran | null> {
        const result = await db.query.pembelajaranTable.findFirst({
            where: eq(pembelajaranTable.id, id),
            with: {
                materials: true,
            } as any,
        })
        return result || null
    }

    async findBySlug(slug: string): Promise<Pembelajaran | null> {
        const result = await db.query.pembelajaranTable.findFirst({
            where: eq(pembelajaranTable.slug, slug),
            with: {
                materials: true,
            } as any,
        })
        return result || null
    }

    async create(data: CreatePembelajaranDto): Promise<Pembelajaran> {
        const result = await db
            .insert(pembelajaranTable)
            .values(data as any)
            .returning()
        return result[0]
    }

    async update(id: number, data: UpdatePembelajaranDto): Promise<Pembelajaran | null> {
        const result = await db
            .update(pembelajaranTable)
            .set({
                ...data,
                updated_at: new Date(),
            } as any)
            .where(eq(pembelajaranTable.id, id))
            .returning()
        return result[0] || null
    }

    async delete(id: number): Promise<Pembelajaran | null> {
        const result = await db
            .delete(pembelajaranTable)
            .where(eq(pembelajaranTable.id, id))
            .returning()
        return result[0] || null
    }
}

export const pembelajaranRepository = new PembelajaranRepository()
