import { NextRequest } from 'next/server'
import { progressService } from '@/lib/services/progress.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/progress/:pembelajaran_id
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
        if (isNaN(idNum)) return errorResponse('ID harus berupa angka', 400)

        const progress = await progressService.getProgress(user.id, idNum)
        return successResponse(progress, 'Progress berhasil diambil')
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('belum dimulai')) return errorResponse(error.message, 404)
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}
