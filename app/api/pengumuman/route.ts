import { NextRequest } from 'next/server'
import { pengumumanService } from '@/lib/services/pengumuman.service'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/pengumuman
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
        const data = await pengumumanService.getAll(limit)
        return successResponse(data, 'Pengumuman berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * POST /api/pengumuman
 */
export async function POST(request: NextRequest) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const body = await request.json()
        const res = await pengumumanService.create(body)
        return successResponse(res, 'Pengumuman berhasil dibuat', 201)
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
