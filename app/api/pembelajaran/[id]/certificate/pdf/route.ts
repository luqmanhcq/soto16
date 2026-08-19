import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pembelajaranSertifikatTable, pembelajaranTable, usersTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

async function getPdfLib() {
    try {
        return await import('pdf-lib')
    } catch (e) {
        throw new Error('Pustaka pdf-lib belum terinstall. Jalankan: npm install pdf-lib')
    }
}

async function getFs() {
    return await import('fs/promises')
}

async function getPath() {
    return await import('path')
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const webinarId = parseInt(id)
        if (isNaN(webinarId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const decoded = await verifyToken(token)
        if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
        const userId = decoded.id

        const [sertifikatRecord] = await db.select().from(pembelajaranSertifikatTable).where(
            and(
                eq(pembelajaranSertifikatTable.user_id, userId),
                eq(pembelajaranSertifikatTable.pembelajaran_id, webinarId)
            )
        ).limit(1)

        if (!sertifikatRecord) {
            return NextResponse.json({ message: 'Sertifikat belum dibuat' }, { status: 404 })
        }

        const [course] = await db.select().from(pembelajaranTable).where(eq(pembelajaranTable.id, webinarId)).limit(1)
        if (!course) {
            return NextResponse.json({ message: 'Kursus tidak ditemukan' }, { status: 404 })
        }

        const { PDFDocument, rgb, StandardFonts } = await getPdfLib()

        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([841.89, 595.28]) // A4 landscape
        const { width, height } = page.getSize()

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

        // Background color
        page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(0.98, 0.98, 0.98),
        })

        // Border
        page.drawRectangle({
            x: 30,
            y: 30,
            width: width - 60,
            height: height - 60,
            borderColor: rgb(0.3, 0.4, 0.7),
            borderWidth: 3,
        })

        // Inner border
        page.drawRectangle({
            x: 40,
            y: 40,
            width: width - 80,
            height: height - 80,
            borderColor: rgb(0.3, 0.4, 0.7),
            borderWidth: 1,
        })

        // Title
        page.drawText('S E R T I F I K A T', {
            x: width / 2 - 180,
            y: height - 140,
            size: 36,
            font: fontBold,
            color: rgb(0.1, 0.2, 0.5),
        })

        // Subtitle
        page.drawText('Kelulusan Pembelajaran', {
            x: width / 2 - 100,
            y: height - 180,
            size: 20,
            font: font,
            color: rgb(0.3, 0.3, 0.3),
        })

        // Divider line
        page.drawLine({
            start: { x: width / 2 - 200, y: height - 200 },
            end: { x: width / 2 + 200, y: height - 200 },
            thickness: 2,
            color: rgb(0.3, 0.4, 0.7),
        })

        // Recipient text
        page.drawText('Diberikan kepada', {
            x: width / 2 - 80,
            y: height - 240,
            size: 16,
            font: font,
            color: rgb(0.4, 0.4, 0.4),
        })

        // Name
        page.drawText(sertifikatRecord.nama.toUpperCase(), {
            x: width / 2 - 200,
            y: height - 280,
            size: 28,
            font: fontBold,
            color: rgb(0.1, 0.2, 0.5),
            maxWidth: 400,
        })

        // NIP
        if (sertifikatRecord.nip) {
            page.drawText(`NIP: ${sertifikatRecord.nip}`, {
                x: width / 2 - 100,
                y: height - 320,
                size: 14,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            })
        }

        // Course info
        page.drawText('Telah menyelesaikan program pembelajaran', {
            x: width / 2 - 140,
            y: height - 360,
            size: 16,
            font: font,
            color: rgb(0.4, 0.4, 0.4),
        })

        page.drawText(`"${course.nama}"`, {
            x: width / 2 - 250,
            y: height - 395,
            size: 20,
            font: fontBold,
            color: rgb(0.1, 0.2, 0.5),
            maxWidth: 500,
        })

        // Details row
        const detailY = height - 440
        const colWidth = 200

        // JP
        if (course.jumlah_jp) {
            page.drawText('Jumlah Jam Pelajaran:', {
                x: width / 2 - colWidth,
                y: detailY,
                size: 12,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            })
            page.drawText(`${course.jumlah_jp} JP`, {
                x: width / 2 + 20,
                y: detailY,
                size: 12,
                font: fontBold,
                color: rgb(0.1, 0.1, 0.1),
            })
        }

        // Scores
        if (sertifikatRecord.pre_test_score !== undefined && sertifikatRecord.pre_test_score !== null) {
            page.drawText('Skor Pre-Test:', {
                x: width / 2 - colWidth,
                y: detailY - 25,
                size: 12,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            })
            page.drawText(`${sertifikatRecord.pre_test_score}%`, {
                x: width / 2 + 20,
                y: detailY - 25,
                size: 12,
                font: fontBold,
                color: rgb(0.1, 0.1, 0.1),
            })
        }

        if (sertifikatRecord.post_test_score !== undefined && sertifikatRecord.post_test_score !== null) {
            page.drawText('Skor Post-Test:', {
                x: width / 2 - colWidth,
                y: detailY - 50,
                size: 12,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            })
            page.drawText(`${sertifikatRecord.post_test_score}%`, {
                x: width / 2 + 20,
                y: detailY - 50,
                size: 12,
                font: fontBold,
                color: rgb(0.1, 0.1, 0.1),
            })
        }

        // Certificate number and date
        const date = new Date(sertifikatRecord.tanggal_kelulusan)
        const dateStr = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })

        page.drawText(`Nomor: ${sertifikatRecord.nomor_sertifikat}`, {
            x: 60,
            y: 100,
            size: 11,
            font: font,
            color: rgb(0.4, 0.4, 0.4),
        })

        page.drawText(`Tanggal: ${dateStr}`, {
            x: 60,
            y: 80,
            size: 11,
            font: font,
            color: rgb(0.4, 0.4, 0.4),
        })

        // Footer note
        page.drawText('Sertifikat ini diterbitkan secara elektronik dan sah tanpa tanda tangan basah.', {
            x: width / 2 - 180,
            y: 50,
            size: 10,
            font: font,
            color: rgb(0.6, 0.6, 0.6),
        })

        const pdfBytes = await pdfDoc.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="sertifikat-${sertifikatRecord.nomor_sertifikat}.pdf"`,
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        })
    } catch (error: unknown) {
        console.error('PDF Generation Error:', error)
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat generate PDF'
        return NextResponse.json({ message: 'Terjadi kesalahan sistem', error: message }, { status: 500 })
    }
}