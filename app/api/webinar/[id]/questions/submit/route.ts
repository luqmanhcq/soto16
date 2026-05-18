import { NextRequest } from 'next/server'
import { webinarQuestionService } from '@/lib/services/webinar-question.service'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/response'

/**
 * POST /api/webinar/[id]/questions/submit
 * Submit jawaban post-test atau monev
 */
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
        // Check if already submitted (simple check)
        const existing = await webinarQuestionService.getUserAnswers(idNum, user.id, type)
        if (existing.length > 0) {
            return errorResponse(`Anda sudah mengirimkan ${type === 'post_test' ? 'Post-test' : 'Monev'} untuk webinar ini.`, 400)
        }

        const savedAnswers = await webinarQuestionService.submitAnswers(idNum, user.id, type, answers)
        return successResponse(savedAnswers, 'Jawaban berhasil dikirim', 201)
    } catch (error: any) {
        return errorResponse(error.message)
    }
}
