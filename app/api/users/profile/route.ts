import { NextRequest } from 'next/server'
import { userService } from '@/lib/services/user.service'
import { updateProfileSchema } from '@/lib/validations/user.validation'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  internalErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

/**
 * GET /api/users/profile
 */
export async function GET(request: NextRequest) {
  const authError = await withAuth(request)
  if (authError) return authError

  const user = (request as AuthenticatedRequest).user
  if (!user) return errorResponse('Unauthorized', 401)

  try {
    const profile = await userService.getProfile(user.id)
    return successResponse(profile, 'Profil admin/user berhasil diambil')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('tidak ditemukan')) return errorResponse(error.message, 404)
      return errorResponse(error.message, 400)
    }
    return internalErrorResponse()
  }
}

/**
 * PUT /api/users/profile
 */
export async function PUT(request: NextRequest) {
  const authError = await withAuth(request)
  if (authError) return authError

  const user = (request as AuthenticatedRequest).user
  if (!user) return errorResponse('Unauthorized', 401)

  try {
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)
    const updatedProfile = await userService.updateProfile(user.id, validatedData)
    return successResponse(updatedProfile, 'Profil berhasil diupdate')
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
