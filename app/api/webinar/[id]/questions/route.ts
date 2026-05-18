import { NextRequest } from 'next/server'
import { webinarQuestionService } from '@/lib/services/webinar-question.service'
import { withRole } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/response'

/**
 * GET /api/webinar/[id]/questions?type=post_test|monev
 * Ambil daftar pertanyaan untuk webinar tertentu
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const idNum = parseInt(id)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'post_test' | 'monev' | undefined

    try {
        const questions = await webinarQuestionService.getByWebinarId(idNum, type)
        return successResponse(questions)
    } catch (error: any) {
        return errorResponse(error.message)
    }
}

/**
 * POST /api/webinar/[id]/questions
 * Simpan atau Update pertanyaan (Admin Only)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withRole(request, ['admin', 'super_admin'])
    if (authError) return authError

    const { id } = await params
    const idNum = parseInt(id)
    const body = await request.json()
    const { type, questions } = body

    if (!type || !questions || !Array.isArray(questions)) {
        return errorResponse('Data tidak valid (type dan questions harus ada)')
    }

    try {
        await webinarQuestionService.saveAllQuestions(idNum, type, questions)
        return successResponse(null, 'Seluruh pertanyaan berhasil disimpan', 201)
    } catch (error: any) {
        return errorResponse(error.message)
    }
}
