import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { sertifikatWebinarService } from '@/lib/services/sertifikat-webinar.service'

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const decoded = await verifyToken(token)
        if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
        const role = decoded.role
        if (role !== 'admin' && role !== 'super_admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const webinarId = searchParams.get('webinar_id')
        const year = searchParams.get('year')
        const exportCsv = searchParams.get('export') === 'csv'

        const filters: { webinar_id?: number; year?: number } = {}
        if (webinarId) filters.webinar_id = parseInt(webinarId)
        if (year) filters.year = parseInt(year)

        const data = await sertifikatWebinarService.getAll(filters)
        const stats = await sertifikatWebinarService.getStats()

        // Export CSV jika diminta
        if (exportCsv) {
            const header = [
                'NIP', 'Nama', 'Jabatan', 'Unit Kerja', 'Nama Webinar',
                'Tanggal Mulai', 'Tanggal Selesai', 'JP', 'Penyelenggara',
                'Nomor Sertifikat', 'Tanggal Generate',
            ].join(',')

            const escapeCsv = (val: string | null | undefined) => {
                const s = (val || '').toString()
                return `"${s.replace(/"/g, '""')}"`
            }

            const rows = data.map((d) => [
                escapeCsv(d.nip),
                escapeCsv(d.nama),
                escapeCsv(d.jabatan),
                escapeCsv(d.unit_kerja),
                escapeCsv(d.nama_webinar),
                escapeCsv(d.tanggal_mulai ? new Date(d.tanggal_mulai).toLocaleDateString('id-ID') : ''),
                escapeCsv(d.tanggal_selesai ? new Date(d.tanggal_selesai).toLocaleDateString('id-ID') : ''),
                escapeCsv(d.jumlah_jp?.toString()),
                escapeCsv(d.penyelenggara),
                escapeCsv(d.nomor_sertifikat),
                escapeCsv(d.created_at ? new Date(d.created_at).toLocaleDateString('id-ID') : ''),
            ].join(','))

            const csv = [header, ...rows].join('\n')
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="rekap-sertifikat-webinar-${year || 'all'}.csv"`,
                },
            })
        }

        return NextResponse.json({ data, stats })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem'
        return NextResponse.json({ message, error: message }, { status: 500 })
    }
}