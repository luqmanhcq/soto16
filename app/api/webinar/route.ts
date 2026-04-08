import { NextRequest } from 'next/server'
import { webinarService } from '@/lib/services/webinar.service'
import { createWebinarSchema } from '@/lib/validations/webinar.validation'
import { withRole, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/webinar
 * Ambil semua webinar dengan filter kategori & status
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const kategori = searchParams.get('kategori') || undefined
        const status = (searchParams.get('status') as any) || undefined
        const limitStr = searchParams.get('limit')
        const limit = limitStr ? parseInt(limitStr) : undefined

        const webinars = await webinarService.getAll({ kategori, status }, limit)
        return successResponse(webinars, 'Daftar webinar berhasil diambil')
    } catch (error) {
        console.error('API Webinar Error:', error)
        if (error instanceof Error) {
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}

/**
 * POST /api/webinar
 * Buat webinar baru (Admin/Super Admin only)
 */
export async function POST(request: NextRequest) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const body = await request.json()
        const validatedData = createWebinarSchema.parse(body)

        const newWebinar = await webinarService.create(validatedData)
        return successResponse(newWebinar, 'Webinar berhasil dibuat', 201)
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path[0]?.toString(),
                message: err.message,
            }))
            return validationErrorResponse(errors)
        }

        if (error instanceof Error) {
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}
