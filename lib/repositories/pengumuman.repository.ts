import { db } from '@/lib/db'
import { pengumumanTable } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export type Pengumuman = typeof pengumumanTable.$inferSelect

export class PengumumanRepository {
    async getAll(limit?: number) {
        const query = db.select().from(pengumumanTable)
        if (limit) query.limit(limit)
        return await query.orderBy(desc(pengumumanTable.created_at))
    }

    async findById(id: number): Promise<Pengumuman | null> {
        const result = await db.select().from(pengumumanTable).where(eq(pengumumanTable.id, id))
        return result[0] || null
    }

    async findBySlug(slug: string): Promise<Pengumuman | null> {
        const result = await db.select().from(pengumumanTable).where(eq(pengumumanTable.slug, slug))
        return result[0] || null
    }

    async create(data: any): Promise<Pengumuman> {
        const result = await db.insert(pengumumanTable).values(data).returning()
        return result[0]
    }

    async update(id: number, data: any): Promise<Pengumuman | null> {
        const result = await db
            .update(pengumumanTable)
            .set({ ...data, updated_at: new Date() })
            .where(eq(pengumumanTable.id, id))
            .returning()
        return result[0] || null
    }

    async delete(id: number): Promise<Pengumuman | null> {
        const result = await db.delete(pengumumanTable).where(eq(pengumumanTable.id, id)).returning()
        return result[0] || null
    }
}

export const pengumumanRepository = new PengumumanRepository()
