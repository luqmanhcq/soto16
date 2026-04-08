import { NextRequest } from 'next/server'
import { webinarService } from '@/lib/services/webinar.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * POST /api/webinar/[id]/join
 * User ikut serta dalam webinar
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

        if (isNaN(idNum)) {
            return errorResponse('ID harus berupa angka', 400)
        }

        const registration = await webinarService.join(idNum, user.id)
        return successResponse(registration, 'Berhasil mendaftar webinar', 201)
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('tidak ditemukan')) {
                return errorResponse(error.message, 404)
            }
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}
