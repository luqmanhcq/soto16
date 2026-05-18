import { NextRequest } from 'next/server'
import { carouselService } from '@/lib/services/carousel.service'
import { carouselSchema } from '@/lib/validations/carousel.validation'
import { withRole } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * PATCH /api/carousel/[id]
 * Update carousel (Admin/Super Admin only)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const body = await request.json()
        const validatedData = carouselSchema.partial().parse(body)

        const updated = await carouselService.update(id, validatedData)
        return successResponse(updated, 'Carousel berhasil diupdate')
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

/**
 * DELETE /api/carousel/[id]
 * Hapus carousel (Admin/Super Admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        await carouselService.delete(id)
        return successResponse(null, 'Carousel berhasil dihapus')
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}
