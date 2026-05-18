import { db } from '@/lib/db'
import { webinarAttendancesTable, usersTable } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export class WebinarAttendanceRepository {
    async markAttendance(userId: number, webinarId: number) {
        const result = await db.insert(webinarAttendancesTable).values({
            user_id: userId,
            webinar_id: webinarId
        }).returning()
        return result[0]
    }

    async getAttendance(userId: number, webinarId: number) {
        const result = await db.select()
            .from(webinarAttendancesTable)
            .where(
                and(
                    eq(webinarAttendancesTable.user_id, userId),
                    eq(webinarAttendancesTable.webinar_id, webinarId)
                )
            )
        return result[0]
    }

    async getAttendanceList(webinarId: number) {
        const rows = await db
            .select()
            .from(webinarAttendancesTable)
            .innerJoin(usersTable, eq(webinarAttendancesTable.user_id, usersTable.id))
            .where(eq(webinarAttendancesTable.webinar_id, webinarId))
            .orderBy(asc(webinarAttendancesTable.created_at))

        return rows.map(row => ({
            ...row.webinar_attendances,
            user: row.users
        }))
    }
}

export const webinarAttendanceRepository = new WebinarAttendanceRepository()
