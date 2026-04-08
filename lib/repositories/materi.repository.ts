import { db } from '@/lib/db'
import { materiTable } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { CreateMateriDto, UpdateMateriDto } from '@/lib/validations/pembelajaran.validation'

export type Materi = typeof materiTable.$inferSelect

export class MateriRepository {
    async getByPembelajaranId(pembelajaranId: number): Promise<Materi[]> {
        return await db.query.materiTable.findMany({
            where: eq(materiTable.pembelajaran_id, pembelajaranId),
            orderBy: [asc(materiTable.urutan)],
        })
    }

    async findById(id: number): Promise<Materi | null> {
        const result = await db.query.materiTable.findFirst({
            where: eq(materiTable.id, id),
        })
        return result || null
    }

    async create(data: CreateMateriDto): Promise<Materi> {
        const result = await db
            .insert(materiTable)
            .values(data as any)
            .returning()
        return result[0]
    }

    async update(id: number, data: UpdateMateriDto): Promise<Materi | null> {
        const result = await db
            .update(materiTable)
            .set({
                ...data,
                updated_at: new Date(),
            } as any)
            .where(eq(materiTable.id, id))
            .returning()
        return result[0] || null
    }

    async delete(id: number): Promise<Materi | null> {
        const result = await db
            .delete(materiTable)
            .where(eq(materiTable.id, id))
            .returning()
        return result[0] || null
    }
}

export const materiRepository = new MateriRepository()
