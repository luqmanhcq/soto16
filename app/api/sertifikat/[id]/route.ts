import { NextRequest } from 'next/server'
import { sertifikatService } from '@/lib/services/sertifikat.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/sertifikat/[id]
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

        // Authorization check: Admin or the owner
        if (user.role !== 'admin' && user.role !== 'super_admin' && certificate.user_id !== user.id) {
            return errorResponse('Bukan usulan milik Anda', 403)
        }

        return successResponse(certificate, 'Detail usulan sertifikat berhasil diambil')
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('tidak ditemukan')) return errorResponse(error.message, 404)
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}

/**
 * DELETE /api/sertifikat/[id]
 */
export async function DELETE(
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

        await sertifikatService.delete(idNum, user.id, user.role)
        return successResponse(null, 'Usulan sertifikat berhasil dihapus')
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('tidak ditemukan')) return errorResponse(error.message, 404)
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}
