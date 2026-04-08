import { NextRequest, NextResponse } from 'next/server'
import { sertifikatService } from '@/lib/services/sertifikat.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/sertifikat/[id]/download
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

        const certificate = await sertifikatService.getById(idNum)

        // Authorization check
        if (user.role !== 'admin' && user.role !== 'super_admin' && certificate.user_id !== user.id) {
            return errorResponse('Bukan usulan milik Anda', 403)
        }

        if (certificate.status !== 'disetujui' || !certificate.file_sertifikat) {
            return errorResponse('Sertifikat belum tersedia untuk didownload', 400)
        }

        // Since we're just handling paths, we can return the path or use a redirect
        // or stream the file if it was real. For this simulation, we'll return
        // the file path or a success response with the link.
        // However, API.md suggests it's a download route.

        return NextResponse.redirect(new URL(certificate.file_sertifikat, request.url))
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('tidak ditemukan')) return errorResponse(error.message, 404)
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}
