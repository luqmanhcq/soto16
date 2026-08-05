import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pembelajaranTable, usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'
import { pembelajaranService } from '@/lib/services/pembelajaran.service'

async function getPdfLib() {
    try {
        return await import('pdf-lib')
    } catch (e) {
        throw new Error('pdf-lib not installed')
    }
}

function getRomanMonth() {
    const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    return months[new Date().getMonth()]
}

/**
 * GET /api/pembelajaran/[id]/certificate/pdf
 * Generate PDF certificate for eligible user
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const idNum = parseInt(id)
        if (isNaN(idNum)) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 })

        // Auth check
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded = verifyToken(token) as any
        if (!decoded?.id) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const userId = decoded.id

        // Check eligibility
        const eligible = await pembelajaranService.isEligibleForCertificate(idNum, userId)
        if (!eligible) {
            return NextResponse.json({ error: 'Belum memenuhi syarat sertifikat' }, { status: 403 })
        }

        // Get user and course data
        const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) })
        const course = await db.query.pembelajaranTable.findFirst({ where: eq(pembelajaranTable.id, idNum) })

        if (!user || !course) {
            return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
        }

        // Look for template
        const templatePath = path.join(process.cwd(), 'public', 'sertifikat', `${idNum}-p.pdf`)
        let templateBytes: Uint8Array

        try {
            templateBytes = await fs.readFile(templatePath)
        } catch {
            // If no template, generate a simple certificate
            return await generateSimpleCertificate(user, course)
        }

        const { PDFDocument, StandardFonts, rgb } = await getPdfLib()
        const pdfDoc = await PDFDocument.load(templateBytes)
        const pages = pdfDoc.getPages()
        const firstPage = pages[0]
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

        const { width, height } = firstPage.getSize()

        // Overlay user data on template
        const now = new Date()
        const dateStr = `${now.getDate()} ${getRomanMonth()} ${now.getFullYear()}`

        firstPage.drawText(user.nama || '', {
            x: width / 2 - 150, y: height / 2 + 40,
            size: 22, font: boldFont, color: rgb(0.1, 0.1, 0.3),
        })

        firstPage.drawText(`NIP. ${user.nip}`, {
            x: width / 2 - 100, y: height / 2 + 10,
            size: 12, font, color: rgb(0.3, 0.3, 0.3),
        })

        firstPage.drawText(course.nama || '', {
            x: width / 2 - 150, y: height / 2 - 30,
            size: 16, font: boldFont, color: rgb(0.1, 0.1, 0.3),
        })

        firstPage.drawText(`${course.jumlah_jp || 0} JP`, {
            x: width / 2 - 30, y: height / 2 - 60,
            size: 12, font, color: rgb(0.3, 0.3, 0.3),
        })

        firstPage.drawText(`Lamongan, ${dateStr}`, {
            x: width / 2 - 60, y: height / 2 - 100,
            size: 11, font, color: rgb(0.4, 0.4, 0.4),
        })

        const pdfBytes = await pdfDoc.save()
        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="sertifikat-${course.slug || idNum}.pdf"`,
            },
        })
    } catch (error) {
        console.error('Certificate PDF error:', error)
        return NextResponse.json({ error: 'Gagal membuat sertifikat' }, { status: 500 })
    }
}

async function generateSimpleCertificate(user: any, course: any) {
    const { PDFDocument, StandardFonts, rgb } = await getPdfLib()
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([842, 595]) // A4 landscape
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const { width, height } = page.getSize()

    const now = new Date()
    const dateStr = `${now.getDate()} ${getRomanMonth()} ${now.getFullYear()}`

    // Border
    page.drawRectangle({ x: 30, y: 30, width: width - 60, height: height - 60, borderColor: rgb(0.2, 0.3, 0.6), borderWidth: 3 })
    page.drawRectangle({ x: 40, y: 40, width: width - 80, height: height - 80, borderColor: rgb(0.6, 0.7, 0.9), borderWidth: 1 })

    // Title
    page.drawText('SERTIFIKAT', { x: width / 2 - 80, y: height - 120, size: 36, font: boldFont, color: rgb(0.15, 0.2, 0.5) })
    page.drawText('SURAJAYA CORPU', { x: width / 2 - 100, y: height - 155, size: 16, font: boldFont, color: rgb(0.4, 0.4, 0.5) })

    // Subtitle
    page.drawText('Diberikan kepada:', { x: width / 2 - 70, y: height - 220, size: 14, font, color: rgb(0.4, 0.4, 0.4) })

    // Name
    page.drawText(user.nama || '', { x: width / 2 - 150, y: height - 270, size: 28, font: boldFont, color: rgb(0.1, 0.1, 0.3) })
    page.drawText(`NIP. ${user.nip}`, { x: width / 2 - 80, y: height - 300, size: 12, font, color: rgb(0.3, 0.3, 0.3) })

    // Course info
    page.drawText('Telah menyelesaikan pembelajaran:', { x: width / 2 - 120, y: height - 350, size: 12, font, color: rgb(0.4, 0.4, 0.4) })
    page.drawText(course.nama || '', { x: width / 2 - 150, y: height - 385, size: 20, font: boldFont, color: rgb(0.15, 0.2, 0.5) })
    page.drawText(`Dengan total ${course.jumlah_jp || 0} Jam Pelajaran`, { x: width / 2 - 110, y: height - 415, size: 12, font, color: rgb(0.4, 0.4, 0.4) })

    // Date
    page.drawText(`Lamongan, ${dateStr}`, { x: width / 2 - 60, y: 120, size: 11, font, color: rgb(0.4, 0.4, 0.4) })
    page.drawText('Kepala BKPSDM Kabupaten Lamongan', { x: width / 2 - 110, y: 95, size: 11, font, color: rgb(0.3, 0.3, 0.3) })

    // Footer
    page.drawText('SURAJAYA CORPU - Kawah Candradimuka Pengembangan Kompetensi ASN', { x: width / 2 - 200, y: 50, size: 8, font, color: rgb(0.6, 0.6, 0.6) })

    const pdfBytes = await pdfDoc.save()
    return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="sertifikat-${course.slug || course.id}.pdf"`,
        },
    })
}
