import { NextRequest } from 'next/server'
import { registerSchema } from '@/lib/validation'
import { authService } from '@/lib/services/auth.service'
import { createdResponse, errorResponse, validationErrorResponse, internalErrorResponse } from '@/lib/response'
import { ZodError } from 'zod'
import { rateLimit, getClientIP } from '@/lib/rateLimiter'

export async function POST(request: NextRequest) {
  // Rate limiting by IP
  const ip = getClientIP(request);
  const rateLimitResponse = rateLimit(`register_${ip}`, 60 * 1000, 5); // 5 permintaan per menit
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json()

    // Validate request
    const validated = registerSchema.parse(body)

    // Call service
    const user = await authService.register(validated)

    return createdResponse(
      {
        id: user.id,
        nip: user.nip,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
      'Registrasi berhasil'
    )
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path[0]?.toString(),
        message: err.message,
      }))
      return validationErrorResponse(errors)
    }

    if (error instanceof Error) {
      // Generic error message to prevent enumeration
      return errorResponse('Registrasi gagal. Silakan periksa data Anda dan coba lagi.', 400)
    }

    return internalErrorResponse()
  }
}
