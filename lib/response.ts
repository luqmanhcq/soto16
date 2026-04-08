import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/dto'

export function successResponse<T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: statusCode }
  )
}

export function createdResponse<T>(
  data: T,
  message: string = 'Created'
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201)
}

export function errorResponse(
  message: string,
  statusCode: number = 400,
  errors: { field?: string; message: string }[] = []
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
    },
    { status: statusCode }
  )
}

export function validationErrorResponse(
  errors: { field?: string; message: string }[]
): NextResponse<ApiResponse<null>> {
  return errorResponse('Validation error', 400, errors)
}

export function unauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 401)
}

export function forbiddenResponse(
  message: string = 'Forbidden'
): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 403)
}

export function notFoundResponse(
  message: string = 'Not found'
): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 404)
}

export function internalErrorResponse(
  message: string = 'Internal server error'
): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 500)
}
