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
 * GET /api/carousel
 * Ambil semua carousel
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const onlyActive = searchParams.get('active') === 'true'
        
        const carousels = await carouselService.getAll(onlyActive)
        return successResponse(carousels, 'Daftar carousel berhasil diambil')
    } catch (error) {
        console.error('API Carousel Error:', error)
        return internalErrorResponse()
    }
}

/**
 * POST /api/carousel
 * Buat carousel baru (Admin/Super Admin only)
 */
export async function POST(request: NextRequest) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const body = await request.json()
        const validatedData = carouselSchema.parse(body)

        const newCarousel = await carouselService.create(validatedData)
        return successResponse(newCarousel, 'Carousel berhasil dibuat', 201)
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
