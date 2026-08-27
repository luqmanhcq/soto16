import { NextRequest } from 'next/server'
import { manajemenPengetahuanService } from '@/lib/services/manajemen-pengetahuan.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { mpProgressSchema } from '@/lib/validations/manajemen-pengetahuan.validation'

/**
 * POST /api/manajemen-pengetahuan/progress
 */
export async function POST(request: NextRequest) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const body = await request.json()
        const parsed = mpProgressSchema.safeParse(body)
        if (!parsed.success) {
            return errorResponse(parsed.error.errors.map(e => e.message).join(', '), 400)
        }
        const res = await manajemenPengetahuanService.updateProgress(
            user.id,
            parsed.data.manajemen_pengetahuan_id,
            parsed.data.current_materi_id || parsed.data.materi_id!,
            parsed.data.status
        )
        return successResponse(res, 'Progress berhasil diupdate')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * GET /api/manajemen-pengetahuan/progress?manajemen_pengetahuan_id=xxx
 */
export async function GET(request: NextRequest) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const { searchParams } = new URL(request.url)
        const mpId = searchParams.get('manajemen_pengetahuan_id')
        if (!mpId) return errorResponse('manajemen_pengetahuan_id diperlukan', 400)

        const res = await manajemenPengetahuanService.getPersonalProgress(user.id, parseInt(mpId))
        return successResponse(res, 'Progress berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}