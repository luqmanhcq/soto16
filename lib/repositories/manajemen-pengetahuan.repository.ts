import { db } from '@/lib/db'
import { manajemenPengetahuanTable, mpMateriTable } from '@/lib/db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import { CreateManajemenPengetahuanDto, UpdateManajemenPengetahuanDto } from '@/lib/validations/manajemen-pengetahuan.validation'

export type ManajemenPengetahuan = typeof manajemenPengetahuanTable.$inferSelect
export type MpMateri = typeof mpMateriTable.$inferSelect
export type ManajemenPengetahuanWithMaterials = ManajemenPengetahuan & { materials: MpMateri[] }

export class ManajemenPengetahuanRepository {
    async getAll(filters?: { kategori?: string }, limit?: number) {
        const rows = await db
            .select({
                id: manajemenPengetahuanTable.id,
                nama: manajemenPengetahuanTable.nama,
                slug: manajemenPengetahuanTable.slug,
                kategori: manajemenPengetahuanTable.kategori,
                deskripsi: manajemenPengetahuanTable.deskripsi,
                jumlah_jp: manajemenPengetahuanTable.jumlah_jp,
                gambar: manajemenPengetahuanTable.gambar,
                created_at: manajemenPengetahuanTable.created_at,
                updated_at: manajemenPengetahuanTable.updated_at,
                materials_count: sql<number>`count(${mpMateriTable.id})`,
            })
            .from(manajemenPengetahuanTable)
            .leftJoin(mpMateriTable, eq(mpMateriTable.manajemen_pengetahuan_id, manajemenPengetahuanTable.id))
            .where(filters?.kategori ? eq(manajemenPengetahuanTable.kategori, filters.kategori) : undefined)
            .groupBy(manajemenPengetahuanTable.id)
            .orderBy(desc(manajemenPengetahuanTable.created_at))
            .limit(limit || 1000)

        return rows as (ManajemenPengetahuan & { materials_count: number })[]
    }

    async findById(id: number): Promise<ManajemenPengetahuanWithMaterials | null> {
        const result = await db.query.manajemenPengetahuanTable.findFirst({
            where: eq(manajemenPengetahuanTable.id, id),
        })
        if (!result) return null

        const materials = await db.query.mpMateriTable.findMany({
            where: eq(mpMateriTable.manajemen_pengetahuan_id, id),
            orderBy: [asc(mpMateriTable.urutan)],
        })

        return {
            ...result,
            materials,
        }
    }

    async findBySlug(slug: string): Promise<ManajemenPengetahuanWithMaterials | null> {
        const result = await db.query.manajemenPengetahuanTable.findFirst({
            where: eq(manajemenPengetahuanTable.slug, slug),
        })
        if (!result) return null

        const materials = await db.query.mpMateriTable.findMany({
            where: eq(mpMateriTable.manajemen_pengetahuan_id, result.id),
            orderBy: [asc(mpMateriTable.urutan)],
        })

        return {
            ...result,
            materials,
        }
    }

    async create(data: CreateManajemenPengetahuanDto): Promise<ManajemenPengetahuan> {
        const result = await db
            .insert(manajemenPengetahuanTable)
            .values(data as any)
            .returning()
        return result[0]
    }

    async update(id: number, data: UpdateManajemenPengetahuanDto): Promise<ManajemenPengetahuan | null> {
        const result = await db
            .update(manajemenPengetahuanTable)
            .set({
                ...data,
                updated_at: new Date(),
            } as any)
            .where(eq(manajemenPengetahuanTable.id, id))
            .returning()
        return result[0] || null
    }

    async delete(id: number): Promise<ManajemenPengetahuan | null> {
        const result = await db
            .delete(manajemenPengetahuanTable)
            .where(eq(manajemenPengetahuanTable.id, id))
            .returning()
        return result[0] || null
    }
}

export const manajemenPengetahuanRepository = new ManajemenPengetahuanRepository()