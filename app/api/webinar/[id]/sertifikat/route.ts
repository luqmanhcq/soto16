import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webinarsTable, webinarParticipantsTable, usersTable, webinarAttendancesTable, webinarUserAnswersTable, webinarQuestionsTable } from '@/lib/db/schema'
import { eq, and, getTableColumns } from 'drizzle-orm'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

function getRomanMonth() {
    const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    return months[new Date().getMonth()]
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const webinarId = parseInt(id)
        if (isNaN(webinarId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

        // 1. Verify User
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        
        const decoded = await verifyToken(token)
        if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
        const userId = (decoded as any).id

        // 2. Fetch Webinar
        const [webinar] = await db.select().from(webinarsTable).where(eq(webinarsTable.id, webinarId))
        if (!webinar) return NextResponse.json({ message: 'Webinar tidak ditemukan' }, { status: 404 })

        if (!webinar.template_sertifikat) {
            return NextResponse.json({ message: 'Template sertifikat belum diatur untuk webinar ini' }, { status: 400 })
        }

        // Check if event has ended
        if (webinar.tanggal_selesai && new Date() < new Date(webinar.tanggal_selesai)) {
            return NextResponse.json({ message: 'Sertifikat belum tersedia karena acara belum selesai' }, { status: 403 })
        }

        // 3. Fetch User Info
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId))

        // 4. Cek Syarat (Peserta, Absen, Monev, Post-test)
        const [participant] = await db.select().from(webinarParticipantsTable).where(
            and(eq(webinarParticipantsTable.user_id, userId), eq(webinarParticipantsTable.webinar_id, webinarId))
        )
        if (!participant) return NextResponse.json({ message: 'Anda belum mendaftar webinar ini' }, { status: 403 })

        const [attendance] = await db.select().from(webinarAttendancesTable).where(
            and(eq(webinarAttendancesTable.user_id, userId), eq(webinarAttendancesTable.webinar_id, webinarId))
        )
        if (!attendance) return NextResponse.json({ message: 'Anda belum mengisi absen' }, { status: 403 })

        // Check if webinar has monev/post-test questions and if user answered them
        const questions = await db.select().from(webinarQuestionsTable).where(eq(webinarQuestionsTable.webinar_id, webinarId))
        
        const hasMonev = questions.some(q => q.type === 'monev')
        const hasPostTest = questions.some(q => q.type === 'post_test')

        const userAnswers = await db.select().from(webinarUserAnswersTable).where(
            and(eq(webinarUserAnswersTable.user_id, userId), eq(webinarUserAnswersTable.webinar_id, webinarId))
        )

        if (hasMonev) {
            const answeredMonev = userAnswers.some(a => a.type === 'monev')
            if (!answeredMonev) return NextResponse.json({ message: 'Anda belum mengisi MONEV' }, { status: 403 })
        }

        if (hasPostTest) {
            const answeredPostTest = userAnswers.some(a => a.type === 'post_test')
            if (!answeredPostTest) return NextResponse.json({ message: 'Anda belum menyelesaikan Post-test' }, { status: 403 })
        }

        // 5. Generate atau ambil Nomor Sertifikat
        let nomor_sertifikat = participant.nomor_sertifikat
        if (!nomor_sertifikat) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000)
            const year = new Date().getFullYear()
            const romanMonth = getRomanMonth()
            nomor_sertifikat = `${randomDigits}/ BPSDM - WASNB / 205.3 / ${webinarId} / ${romanMonth} / ${year}`
            
            // Update to db
            await db.update(webinarParticipantsTable)
                .set({ nomor_sertifikat })
                .where(eq(webinarParticipantsTable.id, participant.id))
        }

        return NextResponse.json({
            data: {
                webinar: {
                    nama_webinar: webinar.nama_webinar,
                    tanggal_mulai: webinar.tanggal_mulai,
                    template_sertifikat: webinar.template_sertifikat,
                    jumlah_jp: webinar.jumlah_jp
                },
                user: {
                    nama: user.nama,
                    nip: user.nip,
                    unit_kerja: user.unit_kerja || 'Surajaya Corpu'
                },
                sertifikat: {
                    nomor: nomor_sertifikat,
                    tanggal_cetak: new Date().toISOString()
                }
            }
        })

    } catch (error: any) {
        return NextResponse.json({ message: 'Terjadi kesalahan sistem', error: error.message }, { status: 500 })
    }
}
