import { NextRequest } from 'next/server'
import { webinarQuestionService } from '@/lib/services/webinar-question.service'
import { withRole } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/response'

/**
 * GET /api/webinar/[id]/questions/results?type=post_test|monev
 * Ambil hasil kuis/monev (Admin Only)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withRole(request, ['admin', 'super_admin'])
    if (authError) return authError

    const { id } = await params
    const idNum = parseInt(id)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'post_test' | 'monev'

    if (!type) return errorResponse('Tipe evaluasi harus ditentukan')

    try {
        const results = await webinarQuestionService.getResults(idNum, type)
        const respondents = await webinarQuestionService.getRespondentList(idNum, type)
        return successResponse({ results, respondents })
    } catch (error: any) {
        return errorResponse(error.message)
    }
}
