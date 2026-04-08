import { NextRequest } from 'next/server'
import { pembelajaranService } from '@/lib/services/pembelajaran.service'
import { createPembelajaranSchema } from '@/lib/validations/pembelajaran.validation'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/pembelajaran
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const kategori = searchParams.get('kategori') || undefined
        const limitStr = searchParams.get('limit')
        const limit = limitStr ? parseInt(limitStr) : undefined

        const courses = await pembelajaranService.getAll({ kategori }, limit)
        return successResponse(courses, 'Daftar pembelajaran mandiri berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * POST /api/pembelajaran - Admin/Super Admin only
 */
export async function POST(request: NextRequest) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const body = await request.json()
        const validatedData = createPembelajaranSchema.parse(body)
        const newCourse = await pembelajaranService.create(validatedData)
        return successResponse(newCourse, 'Pembelajaran mandiri berhasil dibuat', 201)
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path[0]?.toString(),
                message: err.message,
            }))
            return validationErrorResponse(errors)
        }
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
