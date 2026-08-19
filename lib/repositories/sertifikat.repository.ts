import { db } from '@/lib/db'
import { sertifikatUsulanTable, usersTable } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export type SertifikatUsulan = typeof sertifikatUsulanTable.$inferSelect

export class SertifikatRepository {
    async getAll(filters?: { user_id?: number; status?: 'diajukan' | 'disetujui' | 'ditolak' }) {
        const rows = await db
            .select()
            .from(sertifikatUsulanTable)
            .leftJoin(usersTable, eq(sertifikatUsulanTable.user_id, usersTable.id))
            .where(
                and(
                    filters?.user_id ? eq(sertifikatUsulanTable.user_id, filters.user_id) : undefined,
                    filters?.status ? eq(sertifikatUsulanTable.status, filters.status) : undefined
                )
            )
            .orderBy(desc(sertifikatUsulanTable.created_at))

        return rows.map(row => ({
            ...row.sertifikat_usulan,
            user: row.users,
        }))
    }

    async findById(id: number): Promise<SertifikatUsulan | null> {
        const rows = await db
            .select()
            .from(sertifikatUsulanTable)
            .leftJoin(usersTable, eq(sertifikatUsulanTable.user_id, usersTable.id))
            .where(eq(sertifikatUsulanTable.id, id))

        const row = rows[0]
        return row
            ? ({ ...row.sertifikat_usulan, user: row.users } as any)
            : null
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
