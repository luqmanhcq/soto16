import { NextRequest } from 'next/server'
import { pembelajaranService } from '@/lib/services/pembelajaran.service'
import { withRole } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/response'
import * as XLSX from 'xlsx'

/**
 * GET /api/pembelajaran/[id]/recap
 * Rekap peserta pembelajaran: pendaftaran, pre-test, post-test, monev, dan progres materi (Admin Only)
 *
 * Query params:
 *   ?export=excel  -> unduh rekap dalam format .xlsx
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await withRole(request, ['admin', 'super_admin'])
    if (authError) return authError

    const { id } = await params
    const idNum = parseInt(id)
    if (isNaN(idNum)) return errorResponse('ID pembelajaran tidak valid', 400)

    try {
        const recap = await pembelajaranService.getRecap(idNum)
        const { searchParams } = new URL(request.url)
        const exportExcel = searchParams.get('export') === 'excel'

        if (exportExcel) {
            const excelData = recap.rows.map((r: any, index: number) => ({
                No: index + 1,
                NIP: r.nip,
                Nama: r.nama,
                Jabatan: r.jabatan || '',
                'Unit Kerja': r.unit_kerja || '',
                'Tanggal Daftar': r.enrolled_at ? new Date(r.enrolled_at).toLocaleString('id-ID') : '',
                'Pre-Test': r.pre_test.completed ? `${r.pre_test.score}% (${r.pre_test.correct}/${r.pre_test.total})` : '-',
                'Post-Test': r.post_test.completed ? `${r.post_test.score}% (${r.post_test.correct}/${r.post_test.total})` : '-',
                'Monev': r.monev.completed ? 'Selesai' : '-',
                'Status Materi': r.progress.status,
                'Progress Materi': `${r.progress.progress}%`,
                'Tanggal Selesai Materi': r.progress.tanggal_selesai ? new Date(r.progress.tanggal_selesai).toLocaleString('id-ID') : '',
            }))

            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(excelData)
            ws['!cols'] = [
                { wch: 5 },
                { wch: 18 },
                { wch: 30 },
                { wch: 22 },
                { wch: 30 },
                { wch: 20 },
                { wch: 18 },
                { wch: 18 },
                { wch: 10 },
                { wch: 14 },
                { wch: 14 },
                { wch: 20 },
            ]
            XLSX.utils.book_append_sheet(wb, ws, 'Rekap Pembelajaran')

            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

            return new Response(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="rekap-pembelajaran-${idNum}.xlsx"`,
                },
            })
        }

        return successResponse(recap)
    } catch (error: any) {
        return errorResponse(error.message)
    }
}