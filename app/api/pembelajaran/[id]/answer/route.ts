import { NextRequest } from 'next/server'
import { pembelajaranQuestionRepository } from '@/lib/repositories/pembelajaran-question.repository'
import { createPembelajaranAnswerSchema } from '@/lib/validations/pembelajaran.validation'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/pembelajaran/[id]/answer?type=pre_test|post_test|monev
 * Get user's answers for a specific test type
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID tidak valid', 400)

        const type = request.nextUrl.searchParams.get('type')
        if (!type) return errorResponse('Parameter type wajib (pre_test, post_test, monev)', 400)

        const answers = await pembelajaranQuestionRepository.getUserAnswers(user.id, idNum, type)
        return successResponse(answers, 'Jawaban berhasil diambil')
    } catch (error) {
        return internalErrorResponse()
    }
}

/**
 * POST /api/pembelajaran/[id]/answer
 * Submit an answer for a question
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID tidak valid', 400)

        const body = await request.json()
        const validated = createPembelajaranAnswerSchema.parse(body)

        const result = await pembelajaranQuestionRepository.submitAnswer(
            user.id,
            idNum,
            validated.question_id,
            validated.option_id,
            validated.type
        )

        // Calculate current score for this type
        const score = await pembelajaranQuestionRepository.calculateScore(user.id, idNum, validated.type)

        return successResponse({ ...result, score }, 'Jawaban berhasil disimpan')
    } catch (error) {
        if (error instanceof ZodError) return validationErrorResponse(error.errors as any)
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
