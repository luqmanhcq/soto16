import { NextRequest } from 'next/server'
import { webinarQuestionService } from '@/lib/services/webinar-question.service'
import { withRole } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/response'

/**
 * DELETE /api/webinar/questions/[questionId]
 * Hapus pertanyaan (Admin Only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ questionId: string }> }
) {
    const authError = await withRole(request, ['admin', 'super_admin'])
    if (authError) return authError

    const { questionId } = await params
    const idNum = parseInt(questionId)

    try {
        await webinarQuestionService.deleteQuestion(idNum)
        return successResponse(null, 'Pertanyaan berhasil dihapus')
    } catch (error: any) {
        return errorResponse(error.message)
    }
}
