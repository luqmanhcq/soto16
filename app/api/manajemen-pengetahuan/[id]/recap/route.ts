import { NextRequest } from 'next/server'
import { manajemenPengetahuanService } from '@/lib/services/manajemen-pengetahuan.service'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/manajemen-pengetahuan/[id]/recap
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const res = await manajemenPengetahuanService.getRecap(parseInt(id))
        return successResponse(res, 'Rekap manajemen pengetahuan berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}