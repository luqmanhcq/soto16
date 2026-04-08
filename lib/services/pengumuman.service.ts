import { pengumumanRepository } from '@/lib/repositories/pengumuman.repository'

export class PengumumanService {
    async getAll(limit?: number) {
        return await pengumumanRepository.getAll(limit)
    }

    async getById(id: number) {
        const p = await pengumumanRepository.findById(id)
        if (!p) throw new Error('Pengumuman tidak ditemukan')
        return p
    }

    async create(data: { judul: string; slug: string; deskripsi?: string; gambar?: string; link_file?: string }) {
        const existing = await pengumumanRepository.findBySlug(data.slug)
        if (existing) throw new Error('Slug pengumuman sudah digunakan')
        return await pengumumanRepository.create(data)
    }

    async update(id: number, data: any) {
        if (data.slug) {
            const existing = await pengumumanRepository.findBySlug(data.slug)
            if (existing && existing.id !== id) throw new Error('Slug sudah digunakan pengumuman lain')
        }
        return await pengumumanRepository.update(id, data)
    }

    async delete(id: number) {
        return await pengumumanRepository.delete(id)
    }
}

export const pengumumanService = new PengumumanService()
