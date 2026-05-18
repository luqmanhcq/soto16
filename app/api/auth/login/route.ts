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

    // Set cookie for middleware/proxy
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Deteksi apakah domain menggunakan HTTPS (untuk reverse proxy)
    // Jika domain Anda http://sisoto... maka secure harus FALSE
    const isSecure = isProduction && (request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https')

    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: isSecure, 
      sameSite: isSecure ? 'none' : 'lax', // 'none' hanya boleh jika secure: true (HTTPS)
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
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
