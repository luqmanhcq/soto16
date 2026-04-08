import { NextRequest } from 'next/server'
import { dashboardService } from '@/lib/services/dashboard.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/dashboard/stats
 * Ambil data statistik untuk dashboard (Admin vs User)
 */
export async function GET(request: NextRequest) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const stats = await dashboardService.getDashboardData(user.id, user.role)
        return successResponse(stats, 'Statistik dashboard berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
