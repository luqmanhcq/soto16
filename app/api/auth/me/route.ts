import { NextRequest } from 'next/server'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import { authService } from '@/lib/services/auth.service'
import { successResponse, unauthorizedResponse, notFoundResponse, internalErrorResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authError = await withAuth(request)
    if (authError) {
      return authError
    }

    const user = (request as AuthenticatedRequest).user
    if (!user) {
      return unauthorizedResponse()
    }

    // Get user details
    const userDetails = await authService.getUserById(user.id)
    if (!userDetails) {
      return notFoundResponse('User tidak ditemukan')
    }

    return successResponse(userDetails, 'Success')
  } catch (error) {
    console.error(error)
    return internalErrorResponse()
  }
}
