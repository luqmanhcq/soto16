import { pembelajaranRepository } from '@/lib/repositories/pembelajaran.repository'
import { materiRepository } from '@/lib/repositories/materi.repository'
import { progressRepository } from '@/lib/repositories/progress.repository'
import { pembelajaranQuestionRepository } from '@/lib/repositories/pembelajaran-question.repository'
import { CreatePembelajaranDto, UpdatePembelajaranDto, CreateMateriDto, UpdateMateriDto } from '@/lib/validations/pembelajaran.validation'

export class PembelajaranService {
    // Course logic
    async getAll(filters?: { kategori?: string }, limit?: number) {
        return await pembelajaranRepository.getAll(filters, limit)
    }

    async getById(id: number, userId?: number) {
        const p = await pembelajaranRepository.findById(id)
        if (!p) throw new Error('Pembelajaran tidak ditemukan')

        let completionStatus = { hasPreTest: false, hasPostTest: false, hasMonev: false, allMaterialsCompleted: false }
        if (userId) {
            completionStatus = await this.getCompletionStatus(id, userId)
        }

        return { ...p, ...completionStatus }
    }

    async getBySlug(slug: string, userId?: number) {
        const p = await pembelajaranRepository.findBySlug(slug)
        if (!p) throw new Error('Pembelajaran tidak ditemukan')

        let completionStatus = { hasPreTest: false, hasPostTest: false, hasMonev: false, allMaterialsCompleted: false }
        if (userId) {
            completionStatus = await this.getCompletionStatus(p.id, userId)
        }

        return { ...p, ...completionStatus }
    }

    async create(data: CreatePembelajaranDto) {
        const existing = await pembelajaranRepository.findBySlug(data.slug)
        if (existing) throw new Error('Slug sudah digunakan')
        return await pembelajaranRepository.create(data)
    }

    async update(id: number, data: UpdatePembelajaranDto) {
        if (data.slug) {
            const existing = await pembelajaranRepository.findBySlug(data.slug)
            if (existing && existing.id !== id) throw new Error('Slug sudah digunakan oleh pembelajaran lain')
        }

        const updated = await pembelajaranRepository.update(id, data)
        if (!updated) throw new Error('Pembelajaran tidak ditemukan untuk diupdate')
        return updated
    }

    async delete(id: number) {
        const deleted = await pembelajaranRepository.delete(id)
        if (!deleted) throw new Error('Pembelajaran tidak ditemukan untuk dihapus')
        return deleted
    }

    // Materials logic
    async getMaterials(pembelajaranId: number) {
        return await materiRepository.getByPembelajaranId(pembelajaranId)
    }

    async addMaterial(data: CreateMateriDto) {
        const p = await pembelajaranRepository.findById(data.pembelajaran_id)
        if (!p) throw new Error('Pembelajaran tidak ditemukan')
        return await materiRepository.create(data)
    }

    async updateMaterial(id: number, data: UpdateMateriDto) {
        const updated = await materiRepository.update(id, data)
        if (!updated) throw new Error('Materi tidak ditemukan')
        return updated
    }

    async deleteMaterial(id: number) {
        const deleted = await materiRepository.delete(id)
        if (!deleted) throw new Error('Materi tidak ditemukan')
        return deleted
    }

    // Progress logic
    async updateProgress(userId: number, pembelajaranId: number, currentMateriId: number, status: 'proses' | 'selesai') {
        const materials = await materiRepository.getByPembelajaranId(pembelajaranId)
        if (!materials.length) throw new Error('Belum ada materi di pembelajaran ini')

        const currentIdx = materials.findIndex(m => m.id === currentMateriId)
        const total = materials.length
        let progressPercent = Math.round(((currentIdx + 1) / total) * 100)

        let finalStatus = status
        if (progressPercent === 100) finalStatus = 'selesai'

        return await progressRepository.upsert(userId, pembelajaranId, currentMateriId, progressPercent, finalStatus)
    }

    async getPersonalProgress(userId: number, pembelajaranId: number) {
        return await progressRepository.findByUserIdAndPembelajaranId(userId, pembelajaranId)
    }

    // Completion status
    async getCompletionStatus(pembelajaranId: number, userId: number) {
        const [hasPreTest, hasPostTest, hasMonev] = await Promise.all([
            pembelajaranQuestionRepository.hasCompletedTest(userId, pembelajaranId, 'pre_test'),
            pembelajaranQuestionRepository.hasCompletedTest(userId, pembelajaranId, 'post_test'),
            pembelajaranQuestionRepository.hasCompletedTest(userId, pembelajaranId, 'monev'),
        ])

        // Check if all materials are completed
        const progress = await progressRepository.findByUserIdAndPembelajaranId(userId, pembelajaranId)
        const allMaterialsCompleted = progress?.status === 'selesai'

        return { hasPreTest, hasPostTest, hasMonev, allMaterialsCompleted }
    }

    // Certificate eligibility
    async isEligibleForCertificate(pembelajaranId: number, userId: number): Promise<boolean> {
        const status = await this.getCompletionStatus(pembelajaranId, userId)
        return status.hasPreTest && status.hasPostTest && status.hasMonev && status.allMaterialsCompleted
    }
}

export const pembelajaranService = new PembelajaranService()
