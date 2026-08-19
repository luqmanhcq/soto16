import 'dotenv/config'
import { db } from '../lib/db'
import { eq, and, asc } from 'drizzle-orm'
import {
    pembelajaranQuestionsTable,
    pembelajaranOptionsTable,
} from '../lib/db/schema'

async function test() {
    try {
        const questions = await db.query.pembelajaranQuestionsTable.findMany({
            where: and(
                eq(pembelajaranQuestionsTable.pembelajaran_id, 1),
                eq(pembelajaranQuestionsTable.type, 'pre_test' as any)
            ),
            with: {
                options: {
                    orderBy: [asc(pembelajaranOptionsTable.order)],
                },
            },
            orderBy: [asc(pembelajaranQuestionsTable.order)],
        })
        console.log('QUESTIONS:', JSON.stringify(questions, null, 2))
    } catch (error: any) {
        console.error('ERROR:', error)
        console.error('MESSAGE:', error?.message)
        console.error('CAUSE:', error?.cause)
    } finally {
        process.exit(0)
    }
}

test()