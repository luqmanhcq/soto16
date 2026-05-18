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
        console.log(`[API] Attempting join for Webinar ID: ${idNum}, User ID: ${user.id}`)

        if (isNaN(idNum)) {
            console.error(`[API] Invalid Webinar ID: ${id}`)
            return errorResponse('ID harus berupa angka', 400)
        }

        console.log('[API] Calling webinarService.join...')
        const registration = await webinarService.join(idNum, user.id)
        console.log('[API] Join successful:', registration.id)
        
        return successResponse(registration, 'Berhasil mendaftar webinar', 201)
    } catch (error: any) {
        console.error('Join Webinar Error:', error)
        
        // Handle specific database errors
        if (error.code === '23505') {
            return errorResponse('Anda sudah terdaftar di webinar ini', 400)
        }
        if (error.code === '23503') {
            return errorResponse('Data referensi (User/Webinar) tidak valid', 400)
        }

        const message = error instanceof Error ? error.message : 'Gagal mendaftar webinar'
        return errorResponse(message, 400)
    }
}
