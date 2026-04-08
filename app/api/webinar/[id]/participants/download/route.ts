import { NextRequest } from 'next/server'
import { webinarService } from '@/lib/services/webinar.service'
import { withRole } from '@/lib/middleware/auth'
import {
    errorResponse,
    internalErrorResponse,
} from '@/lib/response'
import * as XLSX from 'xlsx'

/**
 * GET /api/webinar/[id]/participants/download
 * Download daftar peserta webinar dalam format Excel
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const { id } = await params
        const webinarId = parseInt(id)

        if (isNaN(webinarId)) {
            return errorResponse('ID webinar tidak valid', 400)
        }

        const participants = await webinarService.getParticipants(webinarId)

        // Format data untuk Excel
        const excelData = participants.map((participant, index) => ({
            No: index + 1,
            NIP: participant.nip,
            Nama: participant.nama,
            Jabatan: participant.jabatan || '',
            'Unit Kerja': participant.unit_kerja || '',
        }))

        // Buat workbook dan worksheet
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(excelData)

        // Set column widths
        const colWidths = [
            { wch: 5 },  // No
            { wch: 20 }, // NIP
            { wch: 30 }, // Nama
            { wch: 25 }, // Jabatan
            { wch: 35 }, // Unit Kerja
        ]
        ws['!cols'] = colWidths

        XLSX.utils.book_append_sheet(wb, ws, 'Peserta Webinar')

        // Generate buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

        // Return sebagai file download
        const response = new Response(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="peserta-webinar-${webinarId}.xlsx"`,
            },
        })

        return response
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 400)
        }
        return internalErrorResponse()
    }
}