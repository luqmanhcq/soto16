import { db } from '@/lib/db'
import {
    usersTable,
    webinarsTable,
    pembelajaranTable,
    sertifikatUsulanTable,
    webinarParticipantsTable,
    pembelajaranProgressTable,
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
                pending: sql`count(*) filter (where status = 'diajukan')`,
                approved: sql`count(*) filter (where status = 'disetujui')`,
                rejected: sql`count(*) filter (where status = 'ditolak')`
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
                completed: sql`count(*) filter (where status = 'selesai')`,
                inProgress: sql`count(*) filter (where status = 'proses')`
            })
            .from(pembelajaranProgressTable)
            .where(eq(pembelajaranProgressTable.user_id, userId))

        // Certificates for this user
        const [certificates] = await db
            .select({
                total: count(),
                approved: sql`count(*) filter (where status = 'disetujui')`
            })
            .from(sertifikatUsulanTable)
            .where(eq(sertifikatUsulanTable.user_id, userId))

        // Calculate total JP from approved certificates
        const [totalJp] = await db
            .select({ sum: sql<number>`sum(jumlah_jp)` })
            .from(sertifikatUsulanTable)
            .where(and(
                eq(sertifikatUsulanTable.user_id, userId),
                eq(sertifikatUsulanTable.status, 'disetujui')
            ))

        return {
            webinarsJoined: webinarsJoined.count,
            lessons: lessonsProgress[0] || { total: 0, completed: 0, inProgress: 0 },
            certificates: certificates || { total: 0, approved: 0 },
            totalJp: totalJp.sum || 0
        }
    }
    async getUserWebinars(userId: number, limit: number = 5) {
        return await db.query.webinarParticipantsTable.findMany({
            where: eq(webinarParticipantsTable.user_id, userId),
            with: {
                webinar: true
            } as any,
            limit: limit,
            orderBy: [desc(webinarParticipantsTable.created_at)]
        })
    }
}

export const dashboardRepository = new DashboardRepository()
