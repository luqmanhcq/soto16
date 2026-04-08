import { NextRequest } from 'next/server'
import { loginSchema } from '@/lib/validation'
import { authService } from '@/lib/services/auth.service'
import { successResponse, errorResponse, validationErrorResponse, internalErrorResponse } from '@/lib/response'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validated = loginSchema.parse(body)

    // Call service
    const result = await authService.login(validated.nip, validated.password)

    const response = successResponse(result, 'Login berhasil', 200)

    // Set cookie for middleware
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return response
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
