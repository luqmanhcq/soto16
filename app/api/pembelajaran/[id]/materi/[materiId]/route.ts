import { NextRequest } from 'next/server'
import { materiRepository } from '@/lib/repositories/materi.repository'
import { updateMateriSchema } from '@/lib/validations/pembelajaran.validation'
import { withRole, withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/pembelajaran/[id]/materi/[materiId]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; materiId: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    try {
        const { materiId } = await params
        const mIdNum = parseInt(materiId)
        if (isNaN(mIdNum)) return errorResponse('ID materi tidak valid', 400)

        const materi = await materiRepository.findById(mIdNum)
        if (!materi) return errorResponse('Materi tidak ditemukan', 404)

        return successResponse(materi, 'Detail materi berhasil diambil')
    } catch (error) {
        return internalErrorResponse()
    }
}

/**
 * PUT /api/pembelajaran/[id]/materi/[materiId]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; materiId: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { materiId } = await params
        const mIdNum = parseInt(materiId)
        const body = await request.json()
        const validatedData = updateMateriSchema.parse(body)

        const updated = await materiRepository.update(mIdNum, validatedData)
        return successResponse(updated, 'Materi berhasil diupdate')
    } catch (error) {
        if (error instanceof ZodError) return validationErrorResponse(error.errors as any)
        return internalErrorResponse()
    }
}

/**
 * DELETE /api/pembelajaran/[id]/materi/[materiId]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; materiId: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { materiId } = await params
        const mIdNum = parseInt(materiId)
        await materiRepository.delete(mIdNum)
        return successResponse(null, 'Materi berhasil dihapus')
    } catch (error) {
        return internalErrorResponse()
    }
}
