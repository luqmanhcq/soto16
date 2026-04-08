import { NextRequest } from 'next/server'
import { webinarService } from '@/lib/services/webinar.service'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/webinar/[id]/participants
 * Ambil daftar peserta webinar (Admin only)
 * Returns: Array of participant objects with user information (nip, nama, jabatan, unit_kerja)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const webinarId = parseInt(id)

        if (isNaN(webinarId)) {
            return errorResponse('ID webinar tidak valid', 400)
        }

        const participants = await webinarService.getParticipants(webinarId)
        return successResponse(participants, 'Daftar peserta berhasil diambil')
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
