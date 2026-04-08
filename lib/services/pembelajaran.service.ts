import { pembelajaranRepository } from '@/lib/repositories/pembelajaran.repository'
import { materiRepository } from '@/lib/repositories/materi.repository'
import { progressRepository } from '@/lib/repositories/progress.repository'
import { CreatePembelajaranDto, UpdatePembelajaranDto, CreateMateriDto, UpdateMateriDto } from '@/lib/validations/pembelajaran.validation'

export class PembelajaranService {
    // Course logic
    async getAll(filters?: { kategori?: string }, limit?: number) {
        return await pembelajaranRepository.getAll(filters, limit)
    }

    async getById(id: number) {
        const p = await pembelajaranRepository.findById(id)
        if (!p) throw new Error('Pembelajaran tidak ditemukan')
        return p
    }

    async getBySlug(slug: string) {
        const p = await pembelajaranRepository.findBySlug(slug)
        if (!p) throw new Error('Pembelajaran tidak ditemukan')
        return p
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

        // Mock percentage calculation (simulated)
        const currentIdx = materials.findIndex(m => m.id === currentMateriId)
        const total = materials.length
        let progressPercent = Math.round(((currentIdx + 1) / total) * 100)

        let finalStatus = status
        if (progressPercent === 100) finalStatus = 'selesai'

        return await progressRepository.upsert(userId, pembelajaranId, currentMateriId, progressPercent, finalStatus)
    }

    async getPersonalProgress(userId: number, pembelajaranId: number) {
        return await progressRepository.findProgress(userId, pembelajaranId)
    }
}

export const pembelajaranService = new PembelajaranService()
