import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { pembelajaranParticipantsTable, pembelajaranTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth'
import {
    successResponse,
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID tidak valid', 400)

        const course = await db.select().from(pembelajaranTable).where(eq(pembelajaranTable.id, idNum)).limit(1)
        if (!course.length) return errorResponse('Kursus tidak ditemukan', 404)

        const enrollment = await db.select().from(pembelajaranParticipantsTable).where(
            and(
                eq(pembelajaranParticipantsTable.user_id, user.id),
                eq(pembelajaranParticipantsTable.pembelajaran_id, idNum)
            )
        ).limit(1)

        return successResponse({
            enrolled: enrollment.length > 0,
            enrollment: enrollment[0] || null,
        })
    } catch (error) {
        return internalErrorResponse()
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withAuth(request)
    if (authError) return authError

    const user = (request as AuthenticatedRequest).user
    if (!user) return errorResponse('Unauthorized', 401)

    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return errorResponse('ID tidak valid', 400)

        const course = await db.select().from(pembelajaranTable).where(eq(pembelajaranTable.id, idNum)).limit(1)
        if (!course.length) return errorResponse('Kursus tidak ditemukan', 404)

        const existing = await db.select().from(pembelajaranParticipantsTable).where(
            and(
                eq(pembelajaranParticipantsTable.user_id, user.id),
                eq(pembelajaranParticipantsTable.pembelajaran_id, idNum)
            )
        ).limit(1)

        if (existing.length > 0) {
            return successResponse(existing[0], 'Anda sudah terdaftar di kursus ini')
        }

        const result = await db.insert(pembelajaranParticipantsTable).values({
            user_id: user.id,
            pembelajaran_id: idNum,
            status: 'aktif',
        }).returning()

        return successResponse(result[0], 'Berhasil mendaftar kursus', 201)
    } catch (error) {
        if (error instanceof Error && error.message.includes('unique')) {
            return errorResponse('Anda sudah terdaftar di kursus ini', 400)
        }
        return internalErrorResponse()
    }
}