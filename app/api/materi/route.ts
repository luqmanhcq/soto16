import { NextRequest } from 'next/server'
import { pembelajaranService } from '@/lib/services/pembelajaran.service'
import { createMateriSchema } from '@/lib/validations/pembelajaran.validation'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * POST /api/materi
 */
export async function POST(request: NextRequest) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const body = await request.json()
        const validatedData = createMateriSchema.parse(body)
        const newMateri = await pembelajaranService.addMaterial(validatedData)
        return successResponse(newMateri, 'Materi berhasil ditambahkan', 201)
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
