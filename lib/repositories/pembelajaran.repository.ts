import { db } from '@/lib/db'
import { pembelajaranTable, materiTable } from '@/lib/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { CreatePembelajaranDto, UpdatePembelajaranDto } from '@/lib/validations/pembelajaran.validation'

export type Pembelajaran = typeof pembelajaranTable.$inferSelect
export type Materi = typeof materiTable.$inferSelect
export type PembelajaranWithMaterials = Pembelajaran & { materials: Materi[] }

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

    async findById(id: number): Promise<PembelajaranWithMaterials | null> {
        const result = await db.query.pembelajaranTable.findFirst({
            where: eq(pembelajaranTable.id, id),
        })
        if (!result) return null

        const materials = await db.query.materiTable.findMany({
            where: eq(materiTable.pembelajaran_id, id),
            orderBy: [asc(materiTable.urutan)],
        })

        return {
            ...result,
            materials,
        }
    }

    async findBySlug(slug: string): Promise<PembelajaranWithMaterials | null> {
        const result = await db.query.pembelajaranTable.findFirst({
            where: eq(pembelajaranTable.slug, slug),
        })
        if (!result) return null

        const materials = await db.query.materiTable.findMany({
            where: eq(materiTable.pembelajaran_id, result.id),
            orderBy: [asc(materiTable.urutan)],
        })

        return {
            ...result,
            materials,
        }
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
