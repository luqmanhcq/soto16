import { NextRequest } from 'next/server'
import { manajemenPengetahuanService } from '@/lib/services/manajemen-pengetahuan.service'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { createManajemenPengetahuanSchema } from '@/lib/validations/manajemen-pengetahuan.validation'

/**
 * GET /api/manajemen-pengetahuan
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
        const kategori = searchParams.get('kategori') || undefined
        const data = await manajemenPengetahuanService.getAll({ kategori }, limit)
        return successResponse(data, 'Manajemen Pengetahuan berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * POST /api/manajemen-pengetahuan
 */
export async function POST(request: NextRequest) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const body = await request.json()
        const parsed = createManajemenPengetahuanSchema.safeParse(body)
        if (!parsed.success) {
            return errorResponse(parsed.error.errors.map(e => e.message).join(', '), 400)
        }
        const res = await manajemenPengetahuanService.create(parsed.data)
        return successResponse(res, 'Manajemen Pengetahuan berhasil dibuat', 201)
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}