import { NextRequest } from 'next/server'
import { webinarQuestionService } from '@/lib/services/webinar-question.service'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/response'

/**
 * POST /api/webinar/[id]/questions/submit
 * Submit jawaban post-test atau monev
 *
 * Aturan:
 * - Post-test: jika nilai < 50%, user boleh mengulang (jawaban lama dihapus,
 *   diganti jawaban baru). Jika sudah >= 50%, tidak boleh submit lagi.
 * - Monev: hanya bisa submit sekali.
 */
/**
 * GET /api/webinar/[id]/questions/submit?type=post_test|monev
 * Cek status submit user (apakah sudah submit, skor post-test, dll).
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const idNum = parseInt(id)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'post_test' | 'monev' | null

    if (!type || (type !== 'post_test' && type !== 'monev')) {
        return errorResponse('Parameter type wajib (post_test atau monev)', 400)
    }

    try {
        const existing = await webinarQuestionService.getUserAnswers(idNum, user.id, type)

        if (existing.length === 0) {
            return successResponse({ submitted: false, score: null, lulus: null, nilaiMin: 50 })
        }

        if (type === 'post_test') {
            const score = await webinarQuestionService.getUserPostTestScore(idNum, user.id)
            return successResponse({
                submitted: true,
                score,
                lulus: score !== null && score >= 50,
                nilaiMin: 50,
                message: score !== null && score < 50
                    ? 'Nilai Post-test Anda kurang dari 50%. Silakan ulangi Post-test.'
                    : 'Post-test telah diselesaikan.',
            })
        }

        return successResponse({ submitted: true, score: null, lulus: null, nilaiMin: null })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem'
        return errorResponse(message)
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const idNum = parseInt(id)
    const body = await request.json()
    const { type, answers } = body

    if (!type || !answers || !Array.isArray(answers)) {
        return errorResponse('Data tidak lengkap')
    }

    try {
        // Cek apakah sudah submit sebelumnya
        const existing = await webinarQuestionService.getUserAnswers(idNum, user.id, type)

        if (existing.length > 0) {
            if (type === 'post_test') {
                // Cek skor post-test terakhir
                const currentScore = await webinarQuestionService.getUserPostTestScore(idNum, user.id)
                if (currentScore !== null && currentScore >= 50) {
                    return errorResponse('Anda sudah lulus Post-test (nilai >= 50%). Tidak dapat mengulang.', 400)
                }
                // Nilai < 50%: boleh ulang — hapus jawaban lama, simpan yang baru
                const savedAnswers = await webinarQuestionService.resubmitPostTest(idNum, user.id, answers)
                return successResponse(savedAnswers, 'Jawaban berhasil diperbarui', 200)
            }

            // Monev: hanya sekali
            return errorResponse('Anda sudah mengirimkan Monev untuk webinar ini.', 400)
        }

        const savedAnswers = await webinarQuestionService.submitAnswers(idNum, user.id, type, answers)
        return successResponse(savedAnswers, 'Jawaban berhasil dikirim', 201)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem'
        return errorResponse(message)
    }
}
