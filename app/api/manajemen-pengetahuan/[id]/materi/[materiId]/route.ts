import { NextRequest } from 'next/server'
import { manajemenPengetahuanService } from '@/lib/services/manajemen-pengetahuan.service'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { updateMpMateriSchema } from '@/lib/validations/manajemen-pengetahuan.validation'

/**
 * PATCH /api/manajemen-pengetahuan/[id]/materi/[materiId]
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; materiId: string }> }
) {
    const { materiId } = await params
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const body = await request.json()
        const parsed = updateMpMateriSchema.safeParse(body)
        if (!parsed.success) {
            return errorResponse(parsed.error.errors.map(e => e.message).join(', '), 400)
        }
        const res = await manajemenPengetahuanService.updateMaterial(parseInt(materiId), parsed.data)
        return successResponse(res, 'Materi berhasil diupdate')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * DELETE /api/manajemen-pengetahuan/[id]/materi/[materiId]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; materiId: string }> }
) {
    const { materiId } = await params
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const res = await manajemenPengetahuanService.deleteMaterial(parseInt(materiId))
        return successResponse(res, 'Materi berhasil dihapus')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}