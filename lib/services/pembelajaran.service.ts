import { pembelajaranRepository } from '@/lib/repositories/pembelajaran.repository'
import { materiRepository } from '@/lib/repositories/materi.repository'
import { progressRepository } from '@/lib/repositories/progress.repository'
import { pembelajaranQuestionRepository } from '@/lib/repositories/pembelajaran-question.repository'
import { pembelajaranParticipantsRepository } from '@/lib/repositories/pembelajaran-participants.repository'
import { pembelajaranSertifikatRepository } from '@/lib/repositories/pembelajaran-sertifikat.repository'
import { CreatePembelajaranDto, UpdatePembelajaranDto, CreateMateriDto, UpdateMateriDto } from '@/lib/validations/pembelajaran.validation'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export class PembelajaranService {
    // Course logic
    async getAll(filters?: { kategori?: string }, limit?: number) {
        return await pembelajaranRepository.getAll(filters, limit)
    }

    async getById(id: number, userId?: number) {
        const p = await pembelajaranRepository.findById(id)
        if (!p) throw new Error('Pembelajaran tidak ditemukan')

        let completionStatus = { hasPreTest: false, hasPostTest: false, hasMonev: false, allMaterialsCompleted: false }
        let enrolled = false
        if (userId) {
            completionStatus = await this.getCompletionStatus(id, userId)
            enrolled = await pembelajaranParticipantsRepository.isEnrolled(userId, id)
        }

        return { ...p, ...completionStatus, enrolled }
    }

    async getBySlug(slug: string, userId?: number) {
        const p = await pembelajaranRepository.findBySlug(slug)
        if (!p) throw new Error('Pembelajaran tidak ditemukan')

        let completionStatus = { hasPreTest: false, hasPostTest: false, hasMonev: false, allMaterialsCompleted: false }
        let enrolled = false
        if (userId) {
            completionStatus = await this.getCompletionStatus(p.id, userId)
            enrolled = await pembelajaranParticipantsRepository.isEnrolled(userId, p.id)
        }

        return { ...p, ...completionStatus, enrolled }
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

    // Enrollment logic
    async enroll(userId: number, pembelajaranId: number) {
        return await pembelajaranParticipantsRepository.enroll(userId, pembelajaranId)
    }

    async isEnrolled(userId: number, pembelajaranId: number): Promise<boolean> {
        return await pembelajaranParticipantsRepository.isEnrolled(userId, pembelajaranId)
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
        // Check enrollment first
        const enrolled = await this.isEnrolled(userId, pembelajaranId)
        if (!enrolled) throw new Error('Anda belum mendaftar di kursus ini')

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

    // Test time limits
    getPreTestDuration(pembelajaranId: number): Promise<number> {
        return pembelajaranRepository.findById(pembelajaranId).then(p => p?.pre_test_duration || 30)
    }

    getPostTestDuration(pembelajaranId: number): Promise<number> {
        return pembelajaranRepository.findById(pembelajaranId).then(p => p?.post_test_duration || 60)
    }

    // Completion status
    async getCompletionStatus(pembelajaranId: number, userId: number) {
        const [hasPreTest, hasPostTest, hasMonev] = await Promise.all([
            pembelajaranQuestionRepository.hasCompletedTest(userId, pembelajaranId, 'pre_test'),
            pembelajaranQuestionRepository.hasCompletedTest(userId, pembelajaranId, 'post_test'),
            pembelajaranQuestionRepository.hasCompletedTest(userId, pembelajaranId, 'monev'),
        ])

        const progress = await progressRepository.findByUserIdAndPembelajaranId(userId, pembelajaranId)
        const allMaterialsCompleted = progress?.status === 'selesai'

        const postTestScore = await pembelajaranQuestionRepository.calculateScore(userId, pembelajaranId, 'post_test')
        const hasPostTestQuestions = await pembelajaranQuestionRepository.getByPembelajaranId(pembelajaranId, 'post_test')
        const postTestLulus = hasPostTestQuestions.length === 0 || postTestScore.score >= 50

        const preTestScore = await pembelajaranQuestionRepository.calculateScore(userId, pembelajaranId, 'pre_test')

        return { hasPreTest, hasPostTest, hasMonev, allMaterialsCompleted, postTestScore: postTestScore.score, postTestLulus, preTestScore: preTestScore.score }
    }

    // Certificate eligibility
    async isEligibleForCertificate(pembelajaranId: number, userId: number): Promise<boolean> {
        const status = await this.getCompletionStatus(pembelajaranId, userId)
        return status.hasPreTest && status.hasPostTest && status.postTestLulus && status.hasMonev && status.allMaterialsCompleted
    }

    // Certificate generation
    async generateCertificate(userId: number, pembelajaranId: number) {
        const eligible = await this.isEligibleForCertificate(pembelajaranId, userId)
        if (!eligible) throw new Error('Belum memenuhi syarat untuk mendapatkan sertifikat')

        const existing = await pembelajaranSertifikatRepository.getByUserAndPembelajaran(userId, pembelajaranId)
        if (existing) return existing

        const [course, user, completionStatus] = await Promise.all([
            pembelajaranRepository.findById(pembelajaranId),
            db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1),
            this.getCompletionStatus(pembelajaranId, userId)
        ])

        if (!course) throw new Error('Pembelajaran tidak ditemukan')
        if (!user.length) throw new Error('User tidak ditemukan')

        const u = user[0]
        const nomor = await this.generateNomorSertifikat(pembelajaranId)

        const sertifikat = await pembelajaranSertifikatRepository.create({
            user_id: userId,
            pembelajaran_id: pembelajaranId,
            nip: u.nip,
            nama: u.nama,
            jabatan: u.jabatan || undefined,
            unit_kerja: u.unit_kerja || undefined,
            nama_pembelajaran: course.nama,
            jumlah_jp: course.jumlah_jp || undefined,
            pre_test_score: completionStatus.preTestScore,
            post_test_score: completionStatus.postTestScore,
            nomor_sertifikat: nomor,
        })

        return sertifikat
    }

    async generateNomorSertifikat(pembelajaranId: number): Promise<string> {
        const year = new Date().getFullYear()
        const count = await pembelajaranSertifikatRepository.getByPembelajaran(pembelajaranId)
        const sequence = count.length + 1
        return `SERT-PBL-${year}-${String(pembelajaranId).padStart(3, '0')}-${String(sequence).padStart(4, '0')}`
    }

    async getCertificate(userId: number, pembelajaranId: number) {
        return await pembelajaranSertifikatRepository.getByUserAndPembelajaran(userId, pembelajaranId)
    }

    // Recap / Rekap peserta
    async getRecap(pembelajaranId: number) {
        const course = await pembelajaranRepository.findById(pembelajaranId)
        if (!course) throw new Error('Pembelajaran tidak ditemukan')

        const [participants, progressRows, preQuestions, postQuestions, monevQuestions, preAnswers, postAnswers, monevAnswers] = await Promise.all([
            pembelajaranParticipantsRepository.getRecapByPembelajaran(pembelajaranId),
            progressRepository.findByPembelajaranId(pembelajaranId),
            pembelajaranQuestionRepository.getByPembelajaranId(pembelajaranId, 'pre_test'),
            pembelajaranQuestionRepository.getByPembelajaranId(pembelajaranId, 'post_test'),
            pembelajaranQuestionRepository.getByPembelajaranId(pembelajaranId, 'monev'),
            pembelajaranQuestionRepository.getAnswersByPembelajaran(pembelajaranId, 'pre_test'),
            pembelajaranQuestionRepository.getAnswersByPembelajaran(pembelajaranId, 'post_test'),
            pembelajaranQuestionRepository.getAnswersByPembelajaran(pembelajaranId, 'monev'),
        ])

        const groupAnswers = (answers: any[]) => {
            const map = new Map<number, any[]>()
            answers.forEach(a => {
                if (!map.has(a.user_id)) map.set(a.user_id, [])
                map.get(a.user_id)!.push(a)
            })
            return map
        }

        const preMap = groupAnswers(preAnswers)
        const postMap = groupAnswers(postAnswers)
        const monevMap = groupAnswers(monevAnswers)

        const computeScore = (userAnswers: any[] | undefined, questions: any[]) => {
            let correct = 0
            for (const q of questions) {
                const answer = (userAnswers || []).find((a: any) => a.question_id === q.id)
                if (answer) {
                    const correctOption = q.options?.find((o: any) => o.is_correct)
                    if (correctOption && answer.option_id === correctOption.id) {
                        correct++
                    }
                }
            }
            return {
                correct,
                total: questions.length,
                score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
            }
        }

        const rows = participants.map(p => {
            const user: any = p.user || {}
            const pre = computeScore(preMap.get(p.user_id), preQuestions)
            const post = computeScore(postMap.get(p.user_id), postQuestions)
            const monevAnswered = monevMap.get(p.user_id)?.length || 0
            const progress = progressRows.find(pr => pr.user_id === p.user_id) || null

            return {
                user_id: p.user_id,
                nip: user.nip || '',
                nama: user.nama || '-',
                email: user.email || '',
                jabatan: user.jabatan || '',
                unit_kerja: user.unit_kerja || '',
                enrolled_at: p.enrolled_at,
                pre_test: {
                    ...pre,
                    completed: preQuestions.length === 0 || (preMap.get(p.user_id)?.length || 0) >= preQuestions.length,
                },
                post_test: {
                    ...post,
                    completed: postQuestions.length === 0 || (postMap.get(p.user_id)?.length || 0) >= postQuestions.length,
                    lulus: postQuestions.length === 0 || (post.score >= 50 && (postMap.get(p.user_id)?.length || 0) >= postQuestions.length),
                },
                monev: {
                    completed: monevQuestions.length === 0 || monevAnswered >= monevQuestions.length,
                },
                progress: {
                    status: progress?.status || 'belum_mulai',
                    progress: progress?.progress || 0,
                    tanggal_selesai: progress?.tanggal_selesai || null,
                }
            }
        })

        const summary = {
            total_peserta: rows.length,
            pre_test_questions: preQuestions.length,
            post_test_questions: postQuestions.length,
            monev_questions: monevQuestions.length,
            pre_test_selesai: rows.filter(r => r.pre_test.completed).length,
            post_test_selesai: rows.filter(r => r.post_test.completed).length,
            post_test_lulus: rows.filter(r => r.post_test.lulus).length,
            monev_selesai: rows.filter(r => r.monev.completed).length,
            selesai: rows.filter(r => r.progress.status === 'selesai').length,
        }

        return {
            course: { id: course.id, nama: course.nama, jumlah_jp: course.jumlah_jp },
            summary,
            rows,
        }
    }
}

export const pembelajaranService = new PembelajaranService()