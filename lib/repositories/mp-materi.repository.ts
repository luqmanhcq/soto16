import { db } from '@/lib/db'
import { mpMateriTable } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { CreateMpMateriDto, UpdateMpMateriDto } from '@/lib/validations/manajemen-pengetahuan.validation'

export class MpMateriRepository {
    async getByMpId(manajemenPengetahuanId: number) {
        return await db.query.mpMateriTable.findMany({
            where: eq(mpMateriTable.manajemen_pengetahuan_id, manajemenPengetahuanId),
            orderBy: [asc(mpMateriTable.urutan)],
        })
    }

    async findById(id: number) {
        const result = await db.query.mpMateriTable.findFirst({
            where: eq(mpMateriTable.id, id),
        })
        return result || null
    }

    async create(data: CreateMpMateriDto) {
        const result = await db
            .insert(mpMateriTable)
            .values(data as any)
            .returning()
        return result[0]
    }

    async update(id: number, data: UpdateMpMateriDto) {
        const result = await db
            .update(mpMateriTable)
            .set({
                ...data,
                updated_at: new Date(),
            } as any)
            .where(eq(mpMateriTable.id, id))
            .returning()
        return result[0] || null
    }

    async delete(id: number) {
        const result = await db
            .delete(mpMateriTable)
            .where(eq(mpMateriTable.id, id))
            .returning()
        return result[0] || null
    }
}

export const mpMateriRepository = new MpMateriRepository()