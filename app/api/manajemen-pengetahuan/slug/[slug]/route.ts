import { NextRequest } from 'next/server'
import { manajemenPengetahuanService } from '@/lib/services/manajemen-pengetahuan.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/manajemen-pengetahuan/slug/[slug]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const authError = await withAuth(request)
    let userId: number | undefined
    
    if (!authError) {
        const user = (request as AuthenticatedRequest).user
        if (user) userId = user.id
    }
    
    try {
        const data = await manajemenPengetahuanService.getBySlug(slug, userId)
        return successResponse(data, 'Detail manajemen pengetahuan berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 404)
        return internalErrorResponse()
    }
}