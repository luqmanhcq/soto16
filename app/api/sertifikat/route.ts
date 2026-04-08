import { NextRequest } from 'next/server'
import { sertifikatService } from '@/lib/services/sertifikat.service'
import { submitSertifikatSchema } from '@/lib/validations/sertifikat.validation'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/sertifikat
 */
export async function GET(request: NextRequest) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const { searchParams } = new URL(request.url)
        const status = (searchParams.get('status') as any) || undefined

        // Admin sees all, ASN sees their own
        if (user.role === 'admin' || user.role === 'super_admin') {
            const proposals = await sertifikatService.getAllForAdmin({ status })
            return successResponse(proposals, 'Daftar usulan sertifikat berhasil diambil')
        } else {
            const proposals = await sertifikatService.getAllByUser(user.id)
            return successResponse(proposals, 'Daftar usulan sertifikat Anda berhasil diambil')
        }
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * POST /api/sertifikat - Submit new proposal
 */
export async function POST(request: NextRequest) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const body = await request.json()
        const validatedData = submitSertifikatSchema.parse(body)
        const newProposal = await sertifikatService.submit(user.id, validatedData)
        return successResponse(newProposal, 'Usulan sertifikat berhasil dikirim', 201)
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
