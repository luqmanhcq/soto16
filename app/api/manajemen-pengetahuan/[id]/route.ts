import { NextRequest } from 'next/server'
import { manajemenPengetahuanService } from '@/lib/services/manajemen-pengetahuan.service'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { updateManajemenPengetahuanSchema } from '@/lib/validations/manajemen-pengetahuan.validation'

/**
 * GET /api/manajemen-pengetahuan/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const data = await manajemenPengetahuanService.getById(parseInt(id))
        return successResponse(data, 'Detail manajemen pengetahuan berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * PATCH /api/manajemen-pengetahuan/[id]
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const body = await request.json()
        const parsed = updateManajemenPengetahuanSchema.safeParse(body)
        if (!parsed.success) {
            return errorResponse(parsed.error.errors.map(e => e.message).join(', '), 400)
        }
        const res = await manajemenPengetahuanService.update(parseInt(id), parsed.data)
        return successResponse(res, 'Manajemen Pengetahuan berhasil diupdate')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * DELETE /api/manajemen-pengetahuan/[id]
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const res = await manajemenPengetahuanService.delete(parseInt(id))
        return successResponse(res, 'Manajemen Pengetahuan berhasil dihapus')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}