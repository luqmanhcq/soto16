import { NextRequest } from 'next/server'
import { sertifikatService } from '@/lib/services/sertifikat.service'
import { rejectSertifikatSchema } from '@/lib/validations/sertifikat.validation'
import { withRole, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * POST /api/sertifikat/[id]/reject - Admin only
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID harus berupa angka', 400)

        const body = await request.json()
        const validatedData = rejectSertifikatSchema.parse(body)
        const rejected = await sertifikatService.reject(idNum, user.id, validatedData)
        return successResponse(rejected, 'Usulan sertifikat berhasil ditolak')
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path[0]?.toString(),
                message: err.message,
            }))
            return validationErrorResponse(errors)
        }
        if (error instanceof Error) {
            if (error.message.includes('tidak ditemukan')) return errorResponse(error.message, 404)
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}
