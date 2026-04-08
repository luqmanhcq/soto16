import { NextRequest } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { withRole, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/admin/users
 * List all users - Super Admin only
 */
export async function GET(request: NextRequest) {
    const roleError = await withRole(request, ['super_admin'])
    if (roleError) return roleError

    try {
        const users = await authService.getAllUsers()
        return successResponse(users, 'Daftar pengguna berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
