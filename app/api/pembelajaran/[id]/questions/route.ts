import { NextRequest } from 'next/server'
import { pembelajaranQuestionRepository } from '@/lib/repositories/pembelajaran-question.repository'
import { createPembelajaranQuestionSchema } from '@/lib/validations/pembelajaran.validation'
import { withRole, withAuth } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/pembelajaran/[id]/questions?type=pre_test|post_test|monev
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID tidak valid', 400)

        const type = request.nextUrl.searchParams.get('type') || undefined
        const questions = await pembelajaranQuestionRepository.getByPembelajaranId(idNum, type)
        return successResponse(questions, 'Daftar pertanyaan berhasil diambil')
    } catch (error) {
        return internalErrorResponse()
    }
}

/**
 * POST /api/pembelajaran/[id]/questions - Admin only
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID tidak valid', 400)

        const body = await request.json()
        const validatedData = createPembelajaranQuestionSchema.parse({ ...body, pembelajaran_id: idNum })
        const newQuestion = await pembelajaranQuestionRepository.create(validatedData)
        return successResponse(newQuestion, 'Pertanyaan berhasil ditambahkan', 201)
    } catch (error) {
        if (error instanceof ZodError) return validationErrorResponse(error.errors as any)
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
