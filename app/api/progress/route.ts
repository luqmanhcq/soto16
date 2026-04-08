import { NextRequest } from 'next/server'
import { progressService } from '@/lib/services/progress.service'
import { progressSchema } from '@/lib/validations/pembelajaran.validation'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * POST /api/progress
 */
export async function POST(request: NextRequest) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const body = await request.json()
        const validatedData = progressSchema.parse(body)
        const result = await progressService.trackProgress(user.id, validatedData)
        return successResponse(result, 'Progress berhasil diperbarui')
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path[0]?.toString(),
                message: err.message,
            }))
            return validationErrorResponse(errors)
        }
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
