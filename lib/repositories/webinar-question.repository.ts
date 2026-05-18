import { db } from '@/lib/db'
import { webinarQuestionsTable, webinarOptionsTable, webinarUserAnswersTable, usersTable } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export class WebinarQuestionRepository {
    async getByWebinarId(webinarId: number, type?: 'post_test' | 'monev') {
        const rows = await db
            .select()
            .from(webinarQuestionsTable)
            .leftJoin(webinarOptionsTable, eq(webinarQuestionsTable.id, webinarOptionsTable.question_id))
            .where(
                and(
                    eq(webinarQuestionsTable.webinar_id, webinarId),
                    type ? eq(webinarQuestionsTable.type, type) : undefined
                )
            )
            .orderBy(asc(webinarQuestionsTable.order), asc(webinarOptionsTable.order))

        // Group options by question
        const result: any[] = []
        rows.forEach(row => {
            const question = row.webinar_questions
            const option = row.webinar_options
            
            let q = result.find(r => r.id === question.id)
            if (!q) {
                q = { ...question, options: [] }
                result.push(q)
            }
            if (option) {
                q.options.push(option)
            }
        })
        return result
    }

    async createQuestion(data: any) {
        const result = await db.insert(webinarQuestionsTable).values(data).returning()
        return result[0]
    }

    async updateQuestion(id: number, data: any) {
        const result = await db.update(webinarQuestionsTable).set(data).where(eq(webinarQuestionsTable.id, id)).returning()
        return result[0]
    }

    async deleteQuestion(id: number) {
        return await db.delete(webinarQuestionsTable).where(eq(webinarQuestionsTable.id, id)).returning()
    }

    async createOption(data: any) {
        const result = await db.insert(webinarOptionsTable).values(data).returning()
        return result[0]
    }

    async deleteOptionsByQuestionId(questionId: number) {
        return await db.delete(webinarOptionsTable).where(eq(webinarOptionsTable.question_id, questionId)).returning()
    }

    async submitAnswer(data: any) {
        const result = await db.insert(webinarUserAnswersTable).values(data).returning()
        return result[0]
    }

    async getUserAnswers(webinarId: number, userId: number, type: 'post_test' | 'monev') {
        return await db.query.webinarUserAnswersTable.findMany({
            where: (answers, { eq, and }) => and(
                eq(answers.webinar_id, webinarId),
                eq(answers.user_id, userId),
                eq(answers.type, type)
            )
        })
    }

    async getResults(webinarId: number, type: 'post_test' | 'monev') {
        const rows = await db
            .select()
            .from(webinarQuestionsTable)
            .leftJoin(webinarOptionsTable, eq(webinarQuestionsTable.id, webinarOptionsTable.question_id))
            .where(
                and(
                    eq(webinarQuestionsTable.webinar_id, webinarId),
                    eq(webinarQuestionsTable.type, type)
                )
            )
            .orderBy(asc(webinarQuestionsTable.order), asc(webinarOptionsTable.order))

        const result: any[] = []
        rows.forEach(row => {
            const question = row.webinar_questions
            const option = row.webinar_options
            
            let q = result.find(r => r.id === question.id)
            if (!q) {
                q = { ...question, options: [] }
                result.push(q)
            }
            if (option) {
                q.options.push(option)
            }
        })
        return result
    }

    async getAllUserAnswers(webinarId: number, type: 'post_test' | 'monev') {
        const rows = await db
            .select()
            .from(webinarUserAnswersTable)
            .innerJoin(usersTable, eq(webinarUserAnswersTable.user_id, usersTable.id))
            .innerJoin(webinarOptionsTable, eq(webinarUserAnswersTable.option_id, webinarOptionsTable.id))
            .where(
                and(
                    eq(webinarUserAnswersTable.webinar_id, webinarId),
                    eq(webinarUserAnswersTable.type, type)
                )
            )

        return rows.map(row => ({
            ...row.webinar_user_answers,
            user: row.users,
            option: row.webinar_options
        }))
    }
}

export const webinarQuestionRepository = new WebinarQuestionRepository()
