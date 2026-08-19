import { db } from '@/lib/db'
import {
    usersTable,
    webinarsTable,
    pembelajaranTable,
    sertifikatUsulanTable,
    webinarParticipantsTable,
    pembelajaranProgressTable,
    sertifikatWebinarTable,
    pembelajaranSertifikatTable,
} from '@/lib/db/schema'
import { eq, count, sql, and, desc } from 'drizzle-orm'

export class DashboardRepository {
    // --- ADMIN STATS ---
    async getAdminStats() {
        const [usersCount] = await db.select({ count: count() }).from(usersTable)
        const [webinarsCount] = await db.select({ count: count() }).from(webinarsTable)
        const [lessonsCount] = await db.select({ count: count() }).from(pembelajaranTable)
        const [certificatesCount] = await db
            .select({
                total: count(),
                pending: sql`count(case when status = 'diajukan' then 1 end)`,
                approved: sql`count(case when status = 'disetujui' then 1 end)`,
                rejected: sql`count(case when status = 'ditolak' then 1 end)`
            })
            .from(sertifikatUsulanTable)

        return {
            totalUsers: usersCount.count,
            totalWebinars: webinarsCount.count,
            totalLessons: lessonsCount.count,
            certificates: certificatesCount,
        }
    }

    // --- USER STATS ---
    async getUserStats(userId: number) {
        // Webinars joined by this user
        const [webinarsJoined] = await db
            .select({ count: count() })
            .from(webinarParticipantsTable)
            .where(eq(webinarParticipantsTable.user_id, userId))

        // Lessons progress for this user
        const lessonsProgress = await db
            .select({
                total: count(),
                completed: sql`count(case when status = 'selesai' then 1 end)`,
                inProgress: sql`count(case when status = 'proses' then 1 end)`
            })
            .from(pembelajaranProgressTable)
            .where(eq(pembelajaranProgressTable.user_id, userId))

        // Certificates for this user
        const [certificates] = await db
            .select({
                total: count(),
                approved: sql`count(case when status = 'disetujui' then 1 end)`
            })
            .from(sertifikatUsulanTable)
            .where(eq(sertifikatUsulanTable.user_id, userId))

        // JP earned from webinar certificates (this year)
        const year = new Date().getFullYear()
        const [webinarJpRow] = await db
            .select({ sum: sql`coalesce(sum(jumlah_jp), 0)` })
            .from(sertifikatWebinarTable)
            .where(and(
                eq(sertifikatWebinarTable.user_id, userId),
                sql`extract(year from "created_at") = ${year}`
            ))

        // JP earned from pembelajaran (e-learning) certificates (this year)
        const [pembelajaranJpRow] = await db
            .select({ sum: sql`coalesce(sum(jumlah_jp), 0)` })
            .from(pembelajaranSertifikatTable)
            .where(and(
                eq(pembelajaranSertifikatTable.user_id, userId),
                sql`extract(year from "created_at") = ${year}`
            ))

        const webinarJp = Number(webinarJpRow?.sum || 0)
        const pembelajaranJp = Number(pembelajaranJpRow?.sum || 0)
        const totalJp = webinarJp + pembelajaranJp

        return {
            webinarsJoined: webinarsJoined.count,
            webinarJp,
            pembelajaranJp,
            lessons: lessonsProgress[0] || { total: 0, completed: 0, inProgress: 0 },
            certificates: certificates || { total: 0, approved: 0 },
            totalJp,
        }
    }
    async getUserWebinars(userId: number, limit: number = 5) {
        const rows = await db
            .select()
            .from(webinarParticipantsTable)
            .leftJoin(webinarsTable, eq(webinarParticipantsTable.webinar_id, webinarsTable.id))
            .where(eq(webinarParticipantsTable.user_id, userId))
            .limit(limit)
            .orderBy(desc(webinarParticipantsTable.created_at))

        return rows.map(row => ({
            ...row.webinar_participants,
            webinar: row.webinars,
        }))
    }
}

export const dashboardRepository = new DashboardRepository()
