import { NextRequest } from 'next/server'
import { manajemenPengetahuanService } from '@/lib/services/manajemen-pengetahuan.service'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { createMpMateriSchema } from '@/lib/validations/manajemen-pengetahuan.validation'

/**
 * GET /api/manajemen-pengetahuan/[id]/materi
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const data = await manajemenPengetahuanService.getMaterials(parseInt(id))
        return successResponse(data, 'Materi berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * POST /api/manajemen-pengetahuan/[id]/materi
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const body = await request.json()
        const parsed = createMpMateriSchema.safeParse({ ...body, manajemen_pengetahuan_id: parseInt(id) })
        if (!parsed.success) {
            return errorResponse(parsed.error.errors.map(e => e.message).join(', '), 400)
        }
        const res = await manajemenPengetahuanService.addMaterial(parsed.data)
        return successResponse(res, 'Materi berhasil ditambahkan', 201)
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}