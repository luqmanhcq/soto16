import { NextRequest } from 'next/server'
import { pembelajaranService } from '@/lib/services/pembelajaran.service'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

/**
 * GET /api/pembelajaran/[id]/certificate
 * Check certificate eligibility and get existing certificate
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID tidak valid', 400)

        const [eligible, completionStatus, course, existingCert] = await Promise.all([
            pembelajaranService.isEligibleForCertificate(idNum, user.id),
            pembelajaranService.getCompletionStatus(idNum, user.id),
            pembelajaranService.getById(idNum),
            pembelajaranService.getCertificate(user.id, idNum),
        ])

        return successResponse({
            eligible,
            course: {
                nama: course.nama,
                jumlah_jp: course.jumlah_jp,
            },
            completion: completionStatus,
            certificate: existingCert,
        }, eligible ? 'Berhak mendapatkan sertifikat' : 'Belum memenuhi syarat sertifikat')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * POST /api/pembelajaran/[id]/certificate
 * Generate certificate for eligible user
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID tidak valid', 400)

        const sertifikat = await pembelajaranService.generateCertificate(user.id, idNum)

        return successResponse(sertifikat, 'Sertifikat berhasil dibuat', 201)
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}