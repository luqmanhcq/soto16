import { webinarAttendanceRepository } from '@/lib/repositories/webinar-attendance.repository'

export class WebinarAttendanceService {
    async markAttendance(userId: number, webinarId: number) {
        // Check if already marked
        const existing = await webinarAttendanceRepository.getAttendance(userId, webinarId)
        if (existing) {
            throw new Error('Anda sudah melakukan absensi untuk webinar ini.')
        }
        return await webinarAttendanceRepository.markAttendance(userId, webinarId)
    }

    async getAttendanceStatus(userId: number, webinarId: number) {
        const attendance = await webinarAttendanceRepository.getAttendance(userId, webinarId)
        return !!attendance
    }

    async getAttendanceList(webinarId: number) {
        return await webinarAttendanceRepository.getAttendanceList(webinarId)
    }
}

export const webinarAttendanceService = new WebinarAttendanceService()
