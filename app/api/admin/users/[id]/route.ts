import { NextRequest } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { withRole } from '@/lib/middleware/auth'
import { userService } from '@/lib/services/user.service'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * PATCH /api/admin/users/[id]
 * User management - Super Admin only
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const body = await request.json()
        
        const updated = await authService.adminUpdateUser(Number(id), body)
        if (!updated) return errorResponse('Pengguna tidak ditemukan', 404)

        return successResponse(updated, 'Detail pengguna berhasil diperbarui')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * DELETE /api/admin/users/[id]
 * User deletion - Super Admin only
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const success = await userService.deleteUser(Number(id))
        if (!success) {
            return errorResponse('User tidak ditemukan atau gagal dihapus', 404)
        }
        return successResponse(null, 'User berhasil dihapus')
    } catch (error: any) {
        return errorResponse(error.message || 'Gagal menghapus user', 500)
    }
}
