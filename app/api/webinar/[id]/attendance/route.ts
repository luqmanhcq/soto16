import { NextRequest } from 'next/server'
import { webinarAttendanceService } from '@/lib/services/webinar-attendance.service'
import { withAuth, AuthenticatedRequest, withRole } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/response'

/**
 * GET /api/webinar/[id]/attendance
 * Ambil daftar absensi (Admin Only) ATAU cek status absensi user sendiri
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const idNum = parseInt(id)

    // Cek apakah admin atau user biasa
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    // Jika admin, bisa lihat semua
    if (user.role === 'admin' || user.role === 'super_admin') {
        try {
            const list = await webinarAttendanceService.getAttendanceList(idNum)
            return successResponse(list)
        } catch (error: any) {
            return errorResponse(error.message)
        }
    } else {
        // Jika user biasa, cek status diri sendiri
        try {
            const isAttended = await webinarAttendanceService.getAttendanceStatus(user.id, idNum)
            return successResponse({ isAttended })
        } catch (error: any) {
            return errorResponse(error.message)
        }
    }
}

/**
 * POST /api/webinar/[id]/attendance
 * Melakukan absensi (User Only)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const idNum = parseInt(id)

    try {
        const result = await webinarAttendanceService.markAttendance(user.id, idNum)
        return successResponse(result, 'Absensi berhasil dicatat', 201)
    } catch (error: any) {
        return errorResponse(error.message)
    }
}
