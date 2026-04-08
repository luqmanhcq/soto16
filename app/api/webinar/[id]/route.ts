import { NextRequest } from 'next/server'
import { webinarService } from '@/lib/services/webinar.service'
import { updateWebinarSchema } from '@/lib/validations/webinar.validation'
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth'
import { verifyToken, getTokenFromCookie } from '@/lib/jwt'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/webinar/[id]
 * Ambil detail webinar berdasarkan ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const idNum = parseInt(id)

        // Try to get authenticated user if any (for isJoined status)
        const token = getTokenFromCookie(request.headers.get('cookie')) ||
            request.headers.get('authorization')?.replace('Bearer ', '')
        const payload = token ? verifyToken(token) : null
        const userId = payload ? (payload as any).id : undefined

        if (isNaN(idNum)) {
            const webinar = await webinarService.getBySlug(id, userId)
            return successResponse(webinar, 'Detail webinar berhasil diambil')
        }

        const webinar = await webinarService.getById(idNum, userId)
        return successResponse(webinar, 'Detail webinar berhasil diambil')
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

/**
 * PUT /api/webinar/[id]
 * Update webinar (Admin/Super Admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const idNum = parseInt(id)

        if (isNaN(idNum)) {
            return errorResponse('ID harus berupa angka', 400)
        }

        const body = await request.json()
        const validatedData = updateWebinarSchema.parse(body)

        const updatedWebinar = await webinarService.update(idNum, validatedData)
        return successResponse(updatedWebinar, 'Webinar berhasil diupdate')
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path[0]?.toString(),
                message: err.message,
            }))
            return validationErrorResponse(errors)
        }

        if (error instanceof Error) {
            if (error.message.includes('tidak ditemukan')) {
                return errorResponse(error.message, 404)
            }
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}

/**
 * DELETE /api/webinar/[id]
 * Hapus webinar (Admin/Super Admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const idNum = parseInt(id)

        if (isNaN(idNum)) {
            return errorResponse('ID harus berupa angka', 400)
        }

        const deletedWebinar = await webinarService.delete(idNum)
        return successResponse(deletedWebinar, 'Webinar berhasil dihapus')
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
