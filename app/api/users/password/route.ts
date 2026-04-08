import { NextRequest } from 'next/server'
import { userService } from '@/lib/services/user.service'
import { updatePasswordSchema } from '@/lib/validations/user.validation'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * PUT /api/users/password
 */
export async function PUT(request: NextRequest) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const body = await request.json()
        const validatedData = updatePasswordSchema.parse(body)
        const result = await userService.updatePassword(user.id, validatedData)
        return successResponse(result, 'Password berhasil diperbarui')
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path[0]?.toString() || 'confirmNewPassword',
                message: err.message,
            }))
            return validationErrorResponse(errors)
        }
        if (error instanceof Error) {
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}
