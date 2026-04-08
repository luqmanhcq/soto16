import { dashboardRepository } from '@/lib/repositories/dashboard.repository'

export class DashboardService {
    async getDashboardData(userId: number, role: string) {
        if (role === 'admin' || role === 'super_admin') {
            return await dashboardRepository.getAdminStats()
        } else {
            const stats = await dashboardRepository.getUserStats(userId)
            const joinedWebinars = await dashboardRepository.getUserWebinars(userId)
            return {
                ...stats,
                joinedWebinars: joinedWebinars.map(p => (p as any).webinar)
            }
        }
    }

    async getRecentActivities(limit: number = 5) {
        // Logic placeholder for activity logs
        return []
    }
}

export const dashboardService = new DashboardService()
