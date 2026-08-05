import { db } from '@/lib/db'
import {
    pembelajaranQuestionsTable,
    pembelajaranOptionsTable,
    pembelajaranUserAnswersTable,
} from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import type { CreatePembelajaranQuestionDto, UpdatePembelajaranQuestionDto } from '@/lib/validations/pembelajaran.validation'

export class PembelajaranQuestionRepository {
    /**
     * Get all questions for a pembelajaran, with options, optionally filtered by type.
     */
    async getByPembelajaranId(pembelajaranId: number, type?: string) {
        const questions = await db.query.pembelajaranQuestionsTable.findMany({
            where: type
                ? and(
                    eq(pembelajaranQuestionsTable.pembelajaran_id, pembelajaranId),
                    eq(pembelajaranQuestionsTable.type, type as any)
                )
                : eq(pembelajaranQuestionsTable.pembelajaran_id, pembelajaranId),
            with: {
                options: {
                    orderBy: [asc(pembelajaranOptionsTable.order)],
                },
            },
            orderBy: [asc(pembelajaranQuestionsTable.order)],
        })
        return questions
    }

    /**
     * Get a single question with its options.
     */
    async findById(id: number) {
        const result = await db.query.pembelajaranQuestionsTable.findFirst({
            where: eq(pembelajaranQuestionsTable.id, id),
            with: {
                options: {
                    orderBy: [asc(pembelajaranOptionsTable.order)],
                },
            },
        })
        return result || null
    }

    /**
     * Create a question with its options in a transaction.
     */
    async create(data: CreatePembelajaranQuestionDto) {
        const { options, ...questionData } = data

        const question = await db
            .insert(pembelajaranQuestionsTable)
            .values(questionData)
            .returning()

        const qId = question[0].id

        if (options && options.length > 0) {
            await db
                .insert(pembelajaranOptionsTable)
                .values(options.map((opt, idx) => ({
                    question_id: qId,
                    option_text: opt.option_text,
                    is_correct: opt.is_correct,
                    order: opt.order ?? idx,
                })))
                .returning()
        }

        return await this.findById(qId)
    }

    /**
     * Update a question and replace its options.
     */
    async update(id: number, data: UpdatePembelajaranQuestionDto) {
        const { options, ...questionData } = data

        if (Object.keys(questionData).length > 0) {
            await db
                .update(pembelajaranQuestionsTable)
                .set({ ...questionData, updated_at: new Date() } as any)
                .where(eq(pembelajaranQuestionsTable.id, id))
        }

        if (options && options.length > 0) {
            // Delete old options
            await db
                .delete(pembelajaranOptionsTable)
                .where(eq(pembelajaranOptionsTable.question_id, id))

            // Insert new options
            await db
                .insert(pembelajaranOptionsTable)
                .values(options.map((opt, idx) => ({
                    question_id: id,
                    option_text: opt.option_text,
                    is_correct: opt.is_correct,
                    order: opt.order ?? idx,
                })))
        }

        return await this.findById(id)
    }

    /**
     * Delete a question (options cascade via FK).
     */
    async delete(id: number) {
        await db
            .delete(pembelajaranQuestionsTable)
            .where(eq(pembelajaranQuestionsTable.id, id))
    }

    /**
     * Submit a user answer.
     */
    async submitAnswer(userId: number, pembelajaranId: number, questionId: number, optionId: number, type: string) {
        // Check if user already answered this question
        const existing = await db.query.pembelajaranUserAnswersTable.findFirst({
            where: and(
                eq(pembelajaranUserAnswersTable.user_id, userId),
                eq(pembelajaranUserAnswersTable.question_id, questionId)
            ),
        })

        if (existing) {
            // Update existing answer
            await db
                .update(pembelajaranUserAnswersTable)
                .set({ option_id: optionId })
                .where(eq(pembelajaranUserAnswersTable.id, existing.id))
            return { updated: true }
        }

        // Insert new answer
        await db
            .insert(pembelajaranUserAnswersTable)
            .values({
                user_id: userId,
                pembelajaran_id: pembelajaranId,
                question_id: questionId,
                option_id: optionId,
                type: type as any,
            })
        return { created: true }
    }

    /**
     * Get user's answers for a specific pembelajaran and type.
     */
    async getUserAnswers(userId: number, pembelajaranId: number, type: string) {
        return await db.query.pembelajaranUserAnswersTable.findMany({
            where: and(
                eq(pembelajaranUserAnswersTable.user_id, userId),
                eq(pembelajaranUserAnswersTable.pembelajaran_id, pembelajaranId),
                eq(pembelajaranUserAnswersTable.type, type as any)
            ),
        })
    }

    /**
     * Check if user has completed a specific test type (answered all questions).
     */
    async hasCompletedTest(userId: number, pembelajaranId: number, type: string): Promise<boolean> {
        const questions = await this.getByPembelajaranId(pembelajaranId, type)
        if (questions.length === 0) return true // No questions = considered completed

        const answers = await this.getUserAnswers(userId, pembelajaranId, type)
        return answers.length >= questions.length
    }

    /**
     * Calculate score for a test type.
     */
    async calculateScore(userId: number, pembelajaranId: number, type: string): Promise<{ score: number; total: number; correct: number }> {
        const questions = await this.getByPembelajaranId(pembelajaranId, type)
        const answers = await this.getUserAnswers(userId, pembelajaranId, type)

        let correct = 0
        for (const q of questions) {
            const answer = answers.find(a => a.question_id === q.id)
            if (answer) {
                const correctOption = q.options.find(o => o.is_correct)
                if (correctOption && answer.option_id === correctOption.id) {
                    correct++
                }
            }
        }

        return {
            score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
            total: questions.length,
            correct,
        }
    }
}

export const pembelajaranQuestionRepository = new PembelajaranQuestionRepository()
