import { manajemenPengetahuanRepository } from '@/lib/repositories/manajemen-pengetahuan.repository'
import { mpMateriRepository } from '@/lib/repositories/mp-materi.repository'
import { mpProgressRepository } from '@/lib/repositories/mp-progress.repository'
import { mpParticipantsRepository } from '@/lib/repositories/mp-participants.repository'
import { CreateManajemenPengetahuanDto, UpdateManajemenPengetahuanDto, CreateMpMateriDto, UpdateMpMateriDto } from '@/lib/validations/manajemen-pengetahuan.validation'

export class ManajemenPengetahuanService {
    // Course logic
    async getAll(filters?: { kategori?: string }, limit?: number) {
        return await manajemenPengetahuanRepository.getAll(filters, limit)
    }

    async getById(id: number, userId?: number) {
        const mp = await manajemenPengetahuanRepository.findById(id)
        if (!mp) throw new Error('Manajemen Pengetahuan tidak ditemukan')

        let allMaterialsCompleted = false
        let enrolled = false
        if (userId) {
            enrolled = await mpParticipantsRepository.isEnrolled(userId, id)
            const progress = await mpProgressRepository.findByUserIdAndMpId(userId, id)
            allMaterialsCompleted = progress?.status === 'selesai'
        }

        return { ...mp, allMaterialsCompleted, enrolled }
    }

    async getBySlug(slug: string, userId?: number) {
        const mp = await manajemenPengetahuanRepository.findBySlug(slug)
        if (!mp) throw new Error('Manajemen Pengetahuan tidak ditemukan')

        let allMaterialsCompleted = false
        let enrolled = false
        if (userId) {
            enrolled = await mpParticipantsRepository.isEnrolled(userId, mp.id)
            const progress = await mpProgressRepository.findByUserIdAndMpId(userId, mp.id)
            allMaterialsCompleted = progress?.status === 'selesai'
        }

        return { ...mp, allMaterialsCompleted, enrolled }
    }

    async create(data: CreateManajemenPengetahuanDto) {
        const existing = await manajemenPengetahuanRepository.findBySlug(data.slug)
        if (existing) throw new Error('Slug sudah digunakan')
        return await manajemenPengetahuanRepository.create(data)
    }

    async update(id: number, data: UpdateManajemenPengetahuanDto) {
        if (data.slug) {
            const existing = await manajemenPengetahuanRepository.findBySlug(data.slug)
            if (existing && existing.id !== id) throw new Error('Slug sudah digunakan oleh manajemen pengetahuan lain')
        }

        const updated = await manajemenPengetahuanRepository.update(id, data)
        if (!updated) throw new Error('Manajemen Pengetahuan tidak ditemukan untuk diupdate')
        return updated
    }

    async delete(id: number) {
        const deleted = await manajemenPengetahuanRepository.delete(id)
        if (!deleted) throw new Error('Manajemen Pengetahuan tidak ditemukan untuk dihapus')
        return deleted
    }

    // Enrollment logic
    async enroll(userId: number, mpId: number) {
        return await mpParticipantsRepository.enroll(userId, mpId)
    }

    async isEnrolled(userId: number, mpId: number): Promise<boolean> {
        return await mpParticipantsRepository.isEnrolled(userId, mpId)
    }

    // Materials logic
    async getMaterials(manajemenPengetahuanId: number) {
        return await mpMateriRepository.getByMpId(manajemenPengetahuanId)
    }

    async addMaterial(data: CreateMpMateriDto) {
        const mp = await manajemenPengetahuanRepository.findById(data.manajemen_pengetahuan_id)
        if (!mp) throw new Error('Manajemen Pengetahuan tidak ditemukan')
        return await mpMateriRepository.create(data)
    }

    async updateMaterial(id: number, data: UpdateMpMateriDto) {
        const updated = await mpMateriRepository.update(id, data)
        if (!updated) throw new Error('Materi tidak ditemukan')
        return updated
    }

    async deleteMaterial(id: number) {
        const deleted = await mpMateriRepository.delete(id)
        if (!deleted) throw new Error('Materi tidak ditemukan')
        return deleted
    }

    // Progress logic
    async updateProgress(userId: number, mpId: number, currentMateriId: number, status: 'belum_mulai' | 'proses' | 'selesai') {
        const enrolled = await this.isEnrolled(userId, mpId)
        if (!enrolled) throw new Error('Anda belum mendaftar di program ini')

        const materials = await mpMateriRepository.getByMpId(mpId)
        if (!materials.length) throw new Error('Belum ada materi di program ini')

        const currentIdx = materials.findIndex(m => m.id === currentMateriId)
        const total = materials.length
        let progressPercent = Math.round(((currentIdx + 1) / total) * 100)

        let finalStatus = status
        if (progressPercent === 100) finalStatus = 'selesai'

        return await mpProgressRepository.upsert(userId, mpId, currentMateriId, progressPercent, finalStatus)
    }

    async getPersonalProgress(userId: number, mpId: number) {
        return await mpProgressRepository.findByUserIdAndMpId(userId, mpId)
    }

    // Recap / Rekap peserta
    async getRecap(manajemenPengetahuanId: number) {
        const mp = await manajemenPengetahuanRepository.findById(manajemenPengetahuanId)
        if (!mp) throw new Error('Manajemen Pengetahuan tidak ditemukan')

        const [participants, progressRows] = await Promise.all([
            mpParticipantsRepository.getRecapByMp(manajemenPengetahuanId),
            mpProgressRepository.findByMpId(manajemenPengetahuanId),
        ])

        const rows = participants.map(p => {
            const user: any = p.user || {}
            const progress = progressRows.find(pr => pr.user_id === p.user_id) || null

            return {
                user_id: p.user_id,
                nip: user.nip || '',
                nama: user.nama || '-',
                email: user.email || '',
                jabatan: user.jabatan || '',
                unit_kerja: user.unit_kerja || '',
                enrolled_at: p.enrolled_at,
                progress: {
                    status: progress?.status || 'belum_mulai',
                    progress: progress?.progress || 0,
                    tanggal_selesai: progress?.tanggal_selesai || null,
                }
            }
        })

        const summary = {
            total_peserta: rows.length,
            total_materi: mp.materials?.length || 0,
            belum_mulai: rows.filter(r => r.progress.status === 'belum_mulai').length,
            proses: rows.filter(r => r.progress.status === 'proses').length,
            selesai: rows.filter(r => r.progress.status === 'selesai').length,
        }

        return {
            course: { id: mp.id, nama: mp.nama, jumlah_jp: mp.jumlah_jp },
            summary,
            rows,
        }
    }
}

export const manajemenPengetahuanService = new ManajemenPengetahuanService()