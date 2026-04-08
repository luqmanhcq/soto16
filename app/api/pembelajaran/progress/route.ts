import { NextRequest } from 'next/server'
import { pembelajaranService } from '@/lib/services/pembelajaran.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { z } from 'zod'

const progressSchema = z.object({
    pembelajaran_id: z.number().int().positive(),
    materi_id: z.number().int().positive(),
    status: z.enum(['proses', 'selesai']).default('proses')
})

/**
 * POST /api/pembelajaran/progress
 * Update user progress in a course
 */
export async function POST(request: NextRequest) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const body = await request.json()
        const validated = progressSchema.parse(body)

        const result = await pembelajaranService.updateProgress(
            user.id,
            validated.pembelajaran_id,
            validated.materi_id,
            validated.status
        )

        return successResponse(result, 'Progress berhasil diperbarui')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse('Validasi gagal', 400, error.errors as any)
        }
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
