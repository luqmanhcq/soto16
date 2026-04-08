import { NextRequest } from 'next/server'
import { userService } from '@/lib/services/user.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse
} from '@/lib/response'
import { updateProfileSchema } from '@/lib/validations/user.validation'
import { ZodError } from 'zod'

/**
 * PUT /api/user/profile
 * Update current user profile info
 */
export async function PUT(request: NextRequest) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const body = await request.json()
        const validated = updateProfileSchema.parse(body)

        const updated = await userService.updateProfile(user.id, validated)
        return successResponse(updated, 'Profil berhasil diperbarui')
    } catch (error) {
        if (error instanceof ZodError) return validationErrorResponse(error.errors as any)
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
