import { NextRequest } from 'next/server'
import { pembelajaranService } from '@/lib/services/pembelajaran.service'
import { updatePembelajaranSchema } from '@/lib/validations/pembelajaran.validation'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/pembelajaran/[id] (can be slug)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const idNum = parseInt(id)

        if (isNaN(idNum)) {
            const course = await pembelajaranService.getBySlug(id)
            return successResponse(course, 'Detail pembelajaran mandiri berhasil diambil')
        }

        const course = await pembelajaranService.getById(idNum)
        return successResponse(course, 'Detail pembelajaran mandiri berhasil diambil')
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('tidak ditemukan')) return errorResponse(error.message, 404)
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}

/**
 * PUT /api/pembelajaran/[id] - Admin/Super Admin only
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
        const validatedData = updatePembelajaranSchema.parse(body)
        const updated = await pembelajaranService.update(idNum, validatedData)
        return successResponse(updated, 'Pembelajaran mandiri berhasil diupdate')
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

/**
 * DELETE /api/pembelajaran/[id] - Admin/Super Admin only
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

        const deleted = await pembelajaranService.delete(idNum)
        return successResponse(deleted, 'Pembelajaran mandiri berhasil dihapus')
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('tidak ditemukan')) return errorResponse(error.message, 404)
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}
