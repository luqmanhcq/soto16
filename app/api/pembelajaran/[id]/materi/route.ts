import { NextRequest } from 'next/server'
import { materiRepository } from '@/lib/repositories/materi.repository'
import { createMateriSchema } from '@/lib/validations/pembelajaran.validation'
import { withRole, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/pembelajaran/[id]/materi
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID kursus tidak valid', 400)

        const materials = await materiRepository.getByPembelajaranId(idNum)
        return successResponse(materials, 'Daftar materi berhasil diambil')
    } catch (error) {
        return internalErrorResponse()
    }
}

/**
 * POST /api/pembelajaran/[id]/materi
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const idNum = parseInt(id)
        const body = await request.json()
        const validatedData = createMateriSchema.parse({ ...body, pembelajaran_id: idNum })

        const newMateri = await materiRepository.create(validatedData)
        return successResponse(newMateri, 'Materi berhasil ditambahkan', 201)
    } catch (error) {
        if (error instanceof ZodError) return validationErrorResponse(error.errors as any)
        return internalErrorResponse()
    }
}
