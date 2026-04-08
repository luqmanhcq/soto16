import { sertifikatRepository } from '@/lib/repositories/sertifikat.repository'
import { SubmitSertifikatDto, ApproveSertifikatDto, RejectSertifikatDto } from '@/lib/validations/sertifikat.validation'

export class SertifikatService {
    async submit(userId: number, dto: SubmitSertifikatDto) {
        return await sertifikatRepository.create(userId, dto)
    }

    async getAllByUser(userId: number) {
        return await sertifikatRepository.getAll({ user_id: userId })
    }

    async getAllForAdmin(filters?: { status?: 'diajukan' | 'disetujui' | 'ditolak' }) {
        return await sertifikatRepository.getAll(filters)
    }

    async getById(id: number) {
        const s = await sertifikatRepository.findById(id)
        if (!s) throw new Error('Usulan sertifikat tidak ditemukan')
        return s
    }

    async approve(id: number, adminId: number, dto: ApproveSertifikatDto) {
        const s = await this.getById(id)
        if (s.status !== 'diajukan') throw new Error('Hanya usulan berstatus \'diajukan\' yang bisa disetujui')

        // Simulate certificate generation or update file if provided
        let file_sertifikat = dto.file_sertifikat
        if (!file_sertifikat) {
            // Logic placeholder for automated generation (e.g., /certificates/GEN-123.pdf)
            file_sertifikat = `/certificates/GEN-${id}.pdf`
        }

        return await sertifikatRepository.updateStatus(id, 'disetujui', file_sertifikat)
    }

    async reject(id: number, adminId: number, dto: RejectSertifikatDto) {
        const s = await this.getById(id)
        if (s.status !== 'diajukan') throw new Error('Hanya usulan berstatus \'diajukan\' yang bisa ditolak')

        // Optional: Log reason to a table (though currently sertifikat_usulan table doesn't have reason field)
        // We could either add it to schema or log it elsewhere.
        return await sertifikatRepository.updateStatus(id, 'ditolak')
    }

    async generate(id: number) {
        const s = await this.getById(id)
        if (s.status !== 'disetujui') throw new Error('Sertifikat hanya bisa di-generate jika status disetujui')

        // Logic for actually creating the PDF
        const mockFile = `/certificates/GEN-${id}.pdf`
        return await sertifikatRepository.updateStatus(id, 'disetujui', mockFile)
    }

    async delete(id: number, userId: number, userRole: string) {
        const s = await this.getById(id)

        // Admin can delete any, user only their own and only if status is diajukan
        if (userRole !== 'admin' && userRole !== 'super_admin') {
            if (s.user_id !== userId) throw new Error('Bukan usulan milik Anda')
            if (s.status !== 'diajukan') throw new Error('Usulan yang sudah diproses tidak bisa dihapus')
        }

        return await sertifikatRepository.delete(id)
    }
}

export const sertifikatService = new SertifikatService()
