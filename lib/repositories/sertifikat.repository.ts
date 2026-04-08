import { db } from '@/lib/db'
import { sertifikatUsulanTable } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export type SertifikatUsulan = typeof sertifikatUsulanTable.$inferSelect

export class SertifikatRepository {
    async getAll(filters?: { user_id?: number; status?: 'diajukan' | 'disetujui' | 'ditolak' }) {
        return await db.query.sertifikatUsulanTable.findMany({
            where: (sertifikat, { eq, and }) => {
                const conditions = []
                if (filters?.user_id) conditions.push(eq(sertifikat.user_id, filters.user_id))
                if (filters?.status) conditions.push(eq(sertifikat.status, filters.status))
                return conditions.length > 0 ? and(...conditions) : undefined
            },
            orderBy: [desc(sertifikatUsulanTable.created_at)],
            with: {
                user: true,
            } as any,
        })
    }

    async findById(id: number): Promise<SertifikatUsulan | null> {
        const result = await db.query.sertifikatUsulanTable.findFirst({
            where: eq(sertifikatUsulanTable.id, id),
            with: {
                user: true,
            } as any,
        })
        return result || null
    }

    async create(userId: number, data: any): Promise<SertifikatUsulan> {
        const result = await db
            .insert(sertifikatUsulanTable)
            .values({
                ...data,
                user_id: userId,
                status: 'diajukan',
            })
            .returning()
        return result[0]
    }

    async updateStatus(id: number, status: 'disetujui' | 'ditolak', fileSertifikat?: string | null) {
        const result = await db
            .update(sertifikatUsulanTable)
            .set({
                status,
                file_sertifikat: fileSertifikat || undefined,
                updated_at: new Date(),
            })
            .where(eq(sertifikatUsulanTable.id, id))
            .returning()
        return result[0] || null
    }

    async delete(id: number) {
        const result = await db
            .delete(sertifikatUsulanTable)
            .where(eq(sertifikatUsulanTable.id, id))
            .returning()
        return result[0] || null
    }
}

export const sertifikatRepository = new SertifikatRepository()
