import { progressRepository } from '@/lib/repositories/progress.repository'
import { ProgressDto } from '@/lib/validations/pembelajaran.validation'

export class ProgressService {
    async trackProgress(userId: number, data: ProgressDto) {
        return await progressRepository.upsert(userId, data)
    }

    async getProgress(userId: number, pembelajaranId: number) {
        const progress = await progressRepository.findByUserIdAndPembelajaranId(userId, pembelajaranId)
        if (!progress) throw new Error('Progress belum dimulai')
        return progress
    }

    async getUserHistory(userId: number) {
        return await progressRepository.getByUser(userId)
    }
}

export const progressService = new ProgressService()
