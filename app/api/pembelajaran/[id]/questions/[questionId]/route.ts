import { NextRequest } from 'next/server'
import { pembelajaranQuestionRepository } from '@/lib/repositories/pembelajaran-question.repository'
import { updatePembelajaranQuestionSchema } from '@/lib/validations/pembelajaran.validation'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * PUT /api/pembelajaran/[id]/questions/[questionId]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; questionId: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { questionId } = await params
        const qIdNum = parseInt(questionId)
        if (isNaN(qIdNum)) return errorResponse('ID pertanyaan tidak valid', 400)

        const body = await request.json()
        const validatedData = updatePembelajaranQuestionSchema.parse(body)
        const updated = await pembelajaranQuestionRepository.update(qIdNum, validatedData)
        return successResponse(updated, 'Pertanyaan berhasil diupdate')
    } catch (error) {
        if (error instanceof ZodError) return validationErrorResponse(error.errors as any)
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * DELETE /api/pembelajaran/[id]/questions/[questionId]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; questionId: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { questionId } = await params
        const qIdNum = parseInt(questionId)
        if (isNaN(qIdNum)) return errorResponse('ID pertanyaan tidak valid', 400)

        await pembelajaranQuestionRepository.delete(qIdNum)
        return successResponse(null, 'Pertanyaan berhasil dihapus')
    } catch (error) {
        return internalErrorResponse()
    }
}
