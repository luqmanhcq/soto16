import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromCookie } from '@/lib/jwt'
import { unauthorizedResponse } from '@/lib/response'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number
    email: string
    role: string
  }
}

export async function withAuth(request: NextRequest) {
  // Get token from cookie or Authorization header
  const token = getTokenFromCookie(request.headers.get('cookie')) ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return unauthorizedResponse('Token tidak ditemukan')
  }

  // Verify token
  const payload = verifyToken(token)
  if (!payload) {
    return unauthorizedResponse('Token tidak valid')
  }

  // Attach user to request
  ;(request as AuthenticatedRequest).user = payload

  return null
}

export async function withRole(request: NextRequest, requiredRoles: string[]) {
  const authError = await withAuth(request)
  if (authError) {
    return authError
  }

  const user = (request as AuthenticatedRequest).user
  if (!user || !requiredRoles.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Role tidak memiliki akses',
      },
      { status: 403 }
    )
  }

  return null
}
