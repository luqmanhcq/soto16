import { NextRequest } from 'next/server'
import { pengumumanService } from '@/lib/services/pengumuman.service'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/pengumuman/slug/[slug]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    try {
        const data = await pengumumanService.getBySlug(slug)
        return successResponse(data, 'Detail pengumuman berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 404)
        return internalErrorResponse()
    }
}