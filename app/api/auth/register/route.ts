import { NextRequest } from 'next/server'
import { registerSchema } from '@/lib/validation'
import { authService } from '@/lib/services/auth.service'
import { createdResponse, errorResponse, validationErrorResponse, internalErrorResponse } from '@/lib/response'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
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
      return errorResponse(error.message, 400)
    }

    return internalErrorResponse()
  }
}
