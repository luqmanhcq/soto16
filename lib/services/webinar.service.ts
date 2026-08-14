import { webinarRepository } from '@/lib/repositories/webinar.repository'
import { CreateWebinarDto, UpdateWebinarDto } from '@/lib/validations/webinar.validation'

export class WebinarService {
    async getAll(filters?: { kategori?: string; status?: 'draft' | 'publish' | 'selesai' }, limit?: number) {
        return await webinarRepository.getAll(filters, limit)
    }

    async getById(id: number, userId?: number) {
        const webinar = await webinarRepository.findById(id)
        if (!webinar) {
            throw new Error('Webinar tidak ditemukan')
        }

        let isJoined = false
        let completionStatus = { hasPostTest: false, hasMonev: false }
        if (userId) {
            isJoined = await webinarRepository.isJoined(id, userId)
            completionStatus = await webinarRepository.getUserCompletionStatus(id, userId)
        }

        return { ...webinar, isJoined, ...completionStatus }
    }

    async getBySlug(slug: string, userId?: number) {
        const webinar = await webinarRepository.findBySlug(slug)
        if (!webinar) {
            throw new Error('Webinar tidak ditemukan')
        }

        let isJoined = false
        let completionStatus = { hasPostTest: false, hasMonev: false }
        if (userId && webinar.id) {
            isJoined = await webinarRepository.isJoined(webinar.id, userId)
            completionStatus = await webinarRepository.getUserCompletionStatus(webinar.id, userId)
        }

        return { ...webinar, isJoined, ...completionStatus }
    }

    async create(data: CreateWebinarDto) {
        const existing = await webinarRepository.findBySlug(data.slug)
        if (existing) {
            throw new Error('Slug sudah digunakan')
        }

        return await webinarRepository.create(data)
    }

    async update(id: number, data: UpdateWebinarDto) {
        if (data.slug) {
            const existing = await webinarRepository.findBySlug(data.slug)
            if (existing && existing.id !== id) {
                throw new Error('Slug sudah digunakan oleh webinar lain')
            }
        }

        const updated = await webinarRepository.update(id, data)
        if (!updated) {
            throw new Error('Webinar tidak ditemukan untuk diupdate')
        }
        return updated
    }

    async delete(id: number) {
        const deleted = await webinarRepository.delete(id)
        if (!deleted) {
            throw new Error('Webinar tidak ditemukan untuk dihapus')
        }
        return deleted
    }

    /**
     * Update status of webinars that have passed their end date to 'selesai'
     */
    async updateOverdueWebinars(): Promise<number> {
        return await webinarRepository.updateStatusToSelesai()
    }

    async join(webinarId: number, userId: number) {
        console.log(`[Service] Joining webinar ${webinarId} for user ${userId}`)
        const webinar = await webinarRepository.findById(webinarId)
        if (!webinar) {
            console.error(`[Service] Webinar ${webinarId} not found`)
            throw new Error('Webinar tidak ditemukan')
        }

        console.log(`[Service] Webinar status: ${webinar.status}`)
        if (webinar.status !== 'publish') {
            throw new Error('Webinar tidak tersedia untuk dikuti')
        }

        const alreadyJoined = await webinarRepository.isJoined(webinarId, userId)
        console.log(`[Service] Already joined: ${alreadyJoined}`)
        if (alreadyJoined) {
            throw new Error('Anda sudah terdaftar di webinar ini')
        }

        console.log('[Service] Executing repository join...')
        return await webinarRepository.join(webinarId, userId)
    }

    async getParticipants(webinarId: number) {
        const participants = await webinarRepository.getParticipants(webinarId)
        
        // Format participants data with user information
        return participants.map((participant: any) => ({
            id: participant.id,
            user_id: participant.user_id,
            webinar_id: participant.webinar_id,
            nip: participant.user?.nip || '',
            nama: participant.user?.nama || '',
            jabatan: participant.user?.jabatan || '',
            unit_kerja: participant.user?.unit_kerja || '',
            email: participant.user?.email || '',
            created_at: participant.created_at,
        }))
    }
}

export const webinarService = new WebinarService()
