import { NextRequest } from 'next/server'
import { pembelajaranService } from '@/lib/services/pembelajaran.service'
import { updateMateriSchema } from '@/lib/validations/pembelajaran.validation'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/materi/[id] - Usually get by pembelajaran_id as per API.md
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID harus berupa angka', 400)

        // Using it as GET /api/materi/:pembelajaran_id
        const materials = await pembelajaranService.getMaterials(idNum)
        return successResponse(materials, 'Daftar materi berhasil diambil')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}

/**
 * PUT /api/materi/[id]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID harus berupa angka', 400)

        const body = await request.json()
        const validatedData = updateMateriSchema.parse(body)
        const updated = await pembelajaranService.updateMaterial(idNum, validatedData)
        return successResponse(updated, 'Materi berhasil diupdate')
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

/**
 * DELETE /api/materi/[id]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID harus berupa angka', 400)

        const deleted = await pembelajaranService.deleteMaterial(idNum)
        return successResponse(deleted, 'Materi berhasil dihapus')
    } catch (error) {
        if (error instanceof Error) return errorResponse(error.message, 400)
        return internalErrorResponse()
    }
}
