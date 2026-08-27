import { db } from '@/lib/db'
import { mpProgressTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { MpProgressDto } from '@/lib/validations/manajemen-pengetahuan.validation'

export class MpProgressRepository {
    async findByUserIdAndMpId(userId: number, manajemenPengetahuanId: number) {
        const result = await db.query.mpProgressTable.findFirst({
            where: (mp, { eq, and }) => and(eq(mp.user_id, userId), eq(mp.manajemen_pengetahuan_id, manajemenPengetahuanId)),
        })
        return result || null
    }

    async findByMpId(manajemenPengetahuanId: number) {
        return await db.query.mpProgressTable.findMany({
            where: eq(mpProgressTable.manajemen_pengetahuan_id, manajemenPengetahuanId),
        })
    }

    async upsert(userId: number, manajemenPengetahuanId: number, currentMateriId: number | null, progress: number, status: 'belum_mulai' | 'proses' | 'selesai') {
        const existing = await this.findByUserIdAndMpId(userId, manajemenPengetahuanId)
        
        if (existing) {
            const updateData: any = {
                current_materi_id: currentMateriId,
                progress,
                status,
                updated_at: new Date(),
            }
            if (status === 'selesai' && !existing.tanggal_selesai) {
                updateData.tanggal_selesai = new Date()
            }
            
            const result = await db
                .update(mpProgressTable)
                .set(updateData)
                .where(eq(mpProgressTable.id, existing.id))
                .returning()
            return result[0]
        } else {
            const insertData: any = {
                user_id: userId,
                manajemen_pengetahuan_id: manajemenPengetahuanId,
                current_materi_id: currentMateriId,
                progress,
                status,
            }
            if (status === 'selesai') {
                insertData.tanggal_selesai = new Date()
            }
            
            const result = await db
                .insert(mpProgressTable)
                .values(insertData)
                .returning()
            return result[0]
        }
    }
}

export const mpProgressRepository = new MpProgressRepository()