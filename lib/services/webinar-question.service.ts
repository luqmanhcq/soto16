import { webinarQuestionRepository } from '@/lib/repositories/webinar-question.repository'

export class WebinarQuestionService {
    async getByWebinarId(webinarId: number, type?: 'post_test' | 'monev') {
        return await webinarQuestionRepository.getByWebinarId(webinarId, type)
    }

    async saveQuestionWithOptions(webinarId: number, data: {
        id?: number,
        type: 'post_test' | 'monev',
        question_text: string,
        order: number,
        options: { id?: number, option_text: string, is_correct: boolean, order: number }[]
    }) {
        let questionId: number

        if (data.id) {
            // Update existing question
            const updated = await webinarQuestionRepository.updateQuestion(data.id, {
                question_text: data.question_text,
                order: data.order,
                updated_at: new Date()
            })
            questionId = updated.id
            // Simple approach: delete all options and re-create them
            await webinarQuestionRepository.deleteOptionsByQuestionId(questionId)
        } else {
            // Create new question
            const created = await webinarQuestionRepository.createQuestion({
                webinar_id: webinarId,
                type: data.type,
                question_text: data.question_text,
                order: data.order
            })
            questionId = created.id
        }

        // Create options
        for (const opt of data.options) {
            await webinarQuestionRepository.createOption({
                question_id: questionId,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                order: opt.order
            })
        }

        return questionId
    }

    async saveAllQuestions(webinarId: number, type: 'post_test' | 'monev', questions: any[]) {
        const existingQuestions = await webinarQuestionRepository.getByWebinarId(webinarId, type)
        const existingIds = existingQuestions.map(q => q.id)
        const currentIds = questions.map(q => q.id).filter(id => id !== undefined)

        // 1. Delete removed questions
        const toDelete = existingIds.filter(id => !currentIds.includes(id))
        for (const id of toDelete) {
            await webinarQuestionRepository.deleteQuestion(id)
        }

        // 2. Save/Update current questions
        for (const q of questions) {
            await this.saveQuestionWithOptions(webinarId, { ...q, type })
        }

        return true
    }

    async deleteQuestion(id: number) {
        return await webinarQuestionRepository.deleteQuestion(id)
    }

    async submitAnswers(webinarId: number, userId: number, type: 'post_test' | 'monev', answers: { question_id: number, option_id: number }[]) {
        const results = []
        for (const ans of answers) {
            const saved = await webinarQuestionRepository.submitAnswer({
                user_id: userId,
                webinar_id: webinarId,
                question_id: ans.question_id,
                option_id: ans.option_id,
                type: type
            })
            results.push(saved)
        }
        return results
    }

    async getUserAnswers(webinarId: number, userId: number, type: 'post_test' | 'monev') {
        return await webinarQuestionRepository.getUserAnswers(webinarId, userId, type)
    }

    async getResults(webinarId: number, type: 'post_test' | 'monev') {
        const questions = await webinarQuestionRepository.getResults(webinarId, type)
        const allAnswers = await webinarQuestionRepository.getAllUserAnswers(webinarId, type)

        // Aggregate results
        return questions.map(q => {
            const questionAnswers = allAnswers.filter(a => a.question_id === q.id)
            const optionStats = q.options.map((opt: any) => ({
                ...opt,
                count: questionAnswers.filter(a => a.option_id === opt.id).length
            }))

            return {
                ...q,
                totalAnswers: questionAnswers.length,
                options: optionStats
            }
        })
    }

    async getRespondentList(webinarId: number, type: 'post_test' | 'monev') {
        const questions = await webinarQuestionRepository.getResults(webinarId, type)
        const allAnswers = await webinarQuestionRepository.getAllUserAnswers(webinarId, type)

        // Group by user
        const userMap = new Map<number, any>()

        allAnswers.forEach(ans => {
            if (!userMap.has(ans.user_id)) {
                userMap.set(ans.user_id, {
                    ...ans.user,
                    answers: []
                })
            }
            userMap.get(ans.user_id).answers.push(ans)
        })

        const respondents = Array.from(userMap.values()).map(user => {
            let score = 0
            if (type === 'post_test' && questions.length > 0) {
                let correctCount = 0
                questions.forEach(q => {
                    const userAns = user.answers.find((a: any) => a.question_id === q.id)
                    const correctOpt = q.options.find((o: any) => o.is_correct)
                    if (userAns && correctOpt && userAns.option_id === correctOpt.id) {
                        correctCount++
                    }
                })
                score = Math.round((correctCount / questions.length) * 100)
            }

            return {
                id: user.id,
                nip: user.nip,
                nama: user.nama,
                jabatan: user.jabatan,
                unit_kerja: user.unit_kerja,
                score: score,
                submitted_at: user.answers[0]?.created_at
            }
        })

        return respondents
    }
}

export const webinarQuestionService = new WebinarQuestionService()
