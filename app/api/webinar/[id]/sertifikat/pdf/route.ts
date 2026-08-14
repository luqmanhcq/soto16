import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webinarsTable, webinarParticipantsTable, usersTable, webinarAttendancesTable, webinarUserAnswersTable, webinarQuestionsTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

// Dynamic import pdf-lib
async function getPdfLib() {
    try {
        return await import('pdf-lib')
    } catch (e) {
        throw new Error('Pustaka pdf-lib belum terinstall.')
    }
}

/**
 * Prepare DOCX XML for docxtemplater (default {tag} delimiters).
 * Handles 3 common template formats users write in Word:
 *   ${nama}  →  {nama}   (strip $ prefix, keep tag)
 *   [nama]   →  {nama}   (convert bracket to curly)
 *   {nama}             (already correct, leave as-is)
 *
 * Also removes Word spellcheck markers that split text runs.
 */
/**
 * Prepare DOCX XML for docxtemplater (default {tag} delimiters).
 * Collapses split curly-brace style {tag} variables into a single clean text run.
 * Handles cases where MS Word splits tags into multiple XML runs.
 */
function prepareXmlForTemplating(xmlText: string): string {
    // Step 1: Remove spellcheck/proofing markers that Word inserts mid-word
    let cleaned = xmlText
        .replace(/<w:proofErr[^/]*\/>/g, '')
        .replace(/<w:noProof\s*\/>/g, '')
        .replace(/<w:noProof>[^<]*<\/w:noProof>/g, '')

    // Step 2: Merge split curly-brace style {tag} -> {tag}
    // This matches { followed by any character sequence (no braces) containing XML tags, ending with }
    // It strips the XML tags inside to join the run.
    cleaned = cleaned.replace(/(\{)([^{}]+)(\})/g, (match, open, content, close) => {
        if (content.includes('<') && content.includes('>')) {
            const plainText = content.replace(/<[^>]+>/g, '').trim()
            return `{${plainText}}`
        }
        return match
    })

// Step 2b: Merge split bracket-style placeholders [ tag ] -> [tag]
    // Word often splits [ nomor ] across multiple <w:t> runs with proofErr markers:
    // <w:t>[</w:t></w:r><w:proofErr.../><w:r><w:t>nomor</w:t></w:r><w:proofErr.../><w:r><w:t>]</w:t>
    // This regex finds [ ... tag ... ] with XML tags in between and merges them.
    cleaned = cleaned.replace(/(\[)\s*(<[^>]+>\s*)*([a-zA-Z_][a-zA-Z0-9_]*)\s*(<[^>]+>\s*)*(\])/g, (match, _open, _beforeTag, tag, _afterTag, _close) => {
        // Check if there are XML tags between the parts (meaning split across runs)
        if (match.includes('<') && match.includes('>')) {
            return `[${tag}]`
        }
        return match
    })

    // Step 2.5: Convert bracket-style placeholders [nama] -> {nama}
    // Word templates sering memakai [nama], [opd], [nip], [nomor] (bukan {nama}).
    // Beberapa template pakai spasi: [ nomor ], [ jabatan ].
    // docxtemplater default hanya mengenali {curly_brace}. Konversi hanya untuk tag yang dikenal.
    const knownTemplateTags = [
        'nama', 'opd', 'nip', 'nomor', 'nomer', 'name', 'jabatan',
        'date', 'unit', 'unit_kerja', 'golongan', 'pangkat',
    ]
    cleaned = cleaned.replace(/\[\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\]/g, (match, tag) => {
        if (knownTemplateTags.includes(tag.toLowerCase())) {
            return `{${tag}}`
        }
        return match
    })

    // Step 3: Pastikan gambar (pic:pic / a:blip) selalu berada di BELAKANG text.
    // Hanya anchor yang berisi gambar yang diubah — text boxes (wps:wsp) tetap di depan.
    // Word modern menulis behindDoc="false"/"true" (bukan "0"/"1").
    cleaned = cleaned.replace(/<wp:anchor\b[^>]*behindDoc="false"[^>]*>[\s\S]*?<\/wp:anchor>/g, (anchor) => {
        if (anchor.includes('<pic:pic') || anchor.includes('<a:blip')) {
            return anchor.replace(/behindDoc="false"/, 'behindDoc="true"')
        }
        return anchor
    })

    // Step 4: DILARANG memaksa semua z-index menjadi negatif.
    // Text boxes (berisi placeholder {nama} dll) memakai z-index positif agar tampil
    // DI ATAS background. Jika dipaksa negatif, text akan tertutup gambar background.

    return cleaned
}

// Convert DOCX buffer → PDF Buffer using a multi-stage high-fidelity pipeline
async function convertDocxToPdf(docxBuffer: Buffer, workDir: string, uniqueId: string): Promise<Buffer | null> {
    const { promisify } = require('util')
    const { exec: _exec } = require('child_process')
    const execAsync = promisify(_exec)

    const tempDocx = path.join(workDir, `cert-${uniqueId}.docx`)
    const tempPdf  = path.join(workDir, `cert-${uniqueId}.pdf`)
    const userProfileDir = path.join(workDir, `lo-${uniqueId}`)

    await fs.writeFile(tempDocx, docxBuffer)

    let pdfBuffer: Buffer | null = null

    // ── STAGE 1: Headless LibreOffice CLI with sandboxed User Profile (Highest Fidelity, Landscape A4 support) ──
    try {
        console.log('[PDF Convert] Stage 1: Attempting LibreOffice CLI with sandboxed profile...')
        await fs.mkdir(userProfileDir, { recursive: true })
        const userProfileUrl = `file:///${userProfileDir.replace(/\\/g, '/')}`

        const sofficePaths = [
            'soffice',
            'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
            'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
        ]

        for (const sof of sofficePaths) {
            try {
                // Pass env configuration to bypass Windows IIS/Service profile restrictions
                const cmd = `"${sof}" --headless "-env:UserInstallation=${userProfileUrl}" --convert-to pdf --outdir "${workDir}" "${tempDocx}"`
                console.log(`[PDF Convert] Executing: ${cmd}`)
                await execAsync(cmd, { timeout: 60000 })

                // LibreOffice outputs <name>.pdf in the outdir
                const baseName = path.basename(tempDocx, '.docx')
                const generatedPdf = path.join(workDir, `${baseName}.pdf`)

                if (generatedPdf !== tempPdf) {
                    try { await fs.rename(generatedPdf, tempPdf) } catch { /* ok */ }
                }

                await fs.access(tempPdf)
                pdfBuffer = await fs.readFile(tempPdf)
                console.log(`[PDF Convert] Stage 1 Success! size=${pdfBuffer!.length} bytes`)
                break
            } catch (e: any) {
                console.warn(`[PDF Convert] Stage 1 path "${sof}" failed: ${e.message}`)
            }
        }
    } catch (e: any) {
        console.error(`[PDF Convert] Stage 1 error: ${e.message}`)
    } finally {
        await fs.rm(userProfileDir, { recursive: true, force: true }).catch(() => {})
    }

    // ── STAGE 2: libreoffice-convert package (In-Memory LibreOffice wrapper fallback) ──
    if (!pdfBuffer) {
        try {
            console.log('[PDF Convert] Stage 2: Attempting libreoffice-convert package...')
            const libre = eval("require")('libreoffice-convert')
            const convertAsync = promisify(libre.convert)
            const res = await convertAsync(docxBuffer, '.pdf', undefined)
            if (res && res.length > 1000) {
                pdfBuffer = res
                console.log(`[PDF Convert] Stage 2 Success! size=${res.length} bytes`)
            }
        } catch (e: any) {
            console.error(`[PDF Convert] Stage 2 error: ${e.message}`)
        }
    }

    // ── STAGE 3: docx-pdf package (Lightweight text-based HTML fallback) ──
    if (!pdfBuffer) {
        try {
            console.log('[PDF Convert] Stage 3: Attempting docx-pdf package...')
            const docxToPdf = eval("require")("docx-pdf")
            await new Promise<void>((resolve, reject) => {
                docxToPdf(tempDocx, tempPdf, (err: any) => {
                    if (err) reject(err); else resolve()
                })
            })

            await fs.access(tempPdf)
            pdfBuffer = await fs.readFile(tempPdf)
            console.log(`[PDF Convert] Stage 3 Success! size=${pdfBuffer!.length} bytes`)
        } catch (e: any) {
            console.error(`[PDF Convert] Stage 3 error: ${e.message}`)
        }
    }

    // Cleanup temp files
    await fs.unlink(tempDocx).catch(() => {})
    await fs.unlink(tempPdf).catch(() => {})

    return pdfBuffer
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
        const userId = decoded.id
        const userRole = decoded.role

        // 2. Fetch Webinar
        const [webinar] = await db.select().from(webinarsTable).where(eq(webinarsTable.id, webinarId))
        if (!webinar) return NextResponse.json({ message: 'Webinar tidak ditemukan' }, { status: 404 })

        if (!webinar.template_sertifikat) {
            return NextResponse.json({ message: 'Template sertifikat belum diatur untuk webinar ini' }, { status: 400 })
        }

        // Admin/Super Admin dapat mengakses sertifikat user tertentu via ?user_id=
        const url = new URL(request.url)
        const queryUserId = url.searchParams.get('user_id')
        const isAdmin = userRole === 'admin' || userRole === 'super_admin'
        if (isAdmin && queryUserId) {
            const targetUserId = parseInt(queryUserId)
            if (isNaN(targetUserId)) {
                return NextResponse.json({ message: 'Invalid user_id' }, { status: 400 })
            }

            const adminPdfPath = path.join(process.cwd(), 'public', 'sertifikat', `${webinarId}-${targetUserId}.pdf`)
            try {
                await fs.access(adminPdfPath)
                const existingPdf = await fs.readFile(adminPdfPath)
                console.log(`[Sertifikat] Admin serving existing PDF for user ${targetUserId}: ${adminPdfPath}`)
                return new NextResponse(new Uint8Array(existingPdf), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `inline; filename="sertifikat-${webinarId}-${targetUserId}.pdf"`,
                        'Cache-Control': 'no-store, no-cache, must-revalidate',
                    },
                })
            } catch {
                return NextResponse.json({ message: 'Sertifikat untuk user tersebut belum di-generate' }, { status: 404 })
            }
        }

        // Check ketersediaan sertifikat (1x24 jam setelah selesai, window 24 jam)
        const { getSertifikatAvailability } = await import('@/lib/utils/sertifikat-availability')
        const availability = getSertifikatAvailability(webinar.tanggal_selesai)
        if (availability.status !== 'tersedia') {
            return NextResponse.json({ message: availability.message }, { status: 403 })
        }

        // 3. Fetch User Info
        let [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId))

        // 3b. Jika golongan/jabatan/unit_kerja kosong, sync dari SIASN lalu simpan
        if (user && (!user.jabatan || !user.golongan || !user.unit_kerja)) {
            console.log(`[Sertifikat] User ${userId} memiliki data ASN tidak lengkap, sync dari SIASN...`)
            const { siasnService } = await import('@/lib/services/siasn.service')
            const synced = await siasnService.syncAsnData(userId, user.nip)
            if (synced) {
                const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId))
                if (updatedUser) user = updatedUser
            }
        }

        // 4. Cek Syarat Peserta, Absen, Monev, Post-test
        const [participant] = await db.select().from(webinarParticipantsTable).where(
            and(eq(webinarParticipantsTable.user_id, userId), eq(webinarParticipantsTable.webinar_id, webinarId))
        )
        if (!participant) return NextResponse.json({ message: 'Anda belum mendaftar webinar ini' }, { status: 403 })

        const [attendance] = await db.select().from(webinarAttendancesTable).where(
            and(eq(webinarAttendancesTable.user_id, userId), eq(webinarAttendancesTable.webinar_id, webinarId))
        )
        if (!attendance) return NextResponse.json({ message: 'Anda belum mengisi absen' }, { status: 403 })

        const questions = await db.select().from(webinarQuestionsTable).where(eq(webinarQuestionsTable.webinar_id, webinarId))
        const hasMonev = questions.some(q => q.type === 'monev')
        const hasPostTest = questions.some(q => q.type === 'post_test')

        const userAnswers = await db.select().from(webinarUserAnswersTable).where(
            and(eq(webinarUserAnswersTable.user_id, userId), eq(webinarUserAnswersTable.webinar_id, webinarId))
        )

        if (hasMonev && !userAnswers.some(a => a.type === 'monev')) {
            return NextResponse.json({ message: 'Anda belum mengisi MONEV' }, { status: 403 })
        }
        if (hasPostTest && !userAnswers.some(a => a.type === 'post_test')) {
            return NextResponse.json({ message: 'Anda belum menyelesaikan Post-test' }, { status: 403 })
        }

        // 5. Generate atau ambil Nomor Sertifikat
        let nomor_sertifikat = participant.nomor_sertifikat
        if (!nomor_sertifikat) {
            const { sertifikatWebinarService } = await import('@/lib/services/sertifikat-webinar.service')
            nomor_sertifikat = await sertifikatWebinarService.generateNomorSertifikat(webinarId)
            await db.update(webinarParticipantsTable)
                .set({ nomor_sertifikat })
                .where(eq(webinarParticipantsTable.id, participant.id))
            await sertifikatWebinarService.createOrUpdate(userId, webinarId, nomor_sertifikat)
        }

        // ─────────────────────────────────────────────────────────────────────
        // 6. Direktori penyimpanan PDF sertifikat
        //    public/sertifikat/<webinarId>-<userId>.pdf
        // ─────────────────────────────────────────────────────────────────────
        const sertifikatDir = path.join(process.cwd(), 'public', 'sertifikat')
        await fs.mkdir(sertifikatDir, { recursive: true })

        const savedPdfFileName = `${webinarId}-${userId}.pdf`
        const savedPdfPath     = path.join(sertifikatDir, savedPdfFileName)

        // Check if we need force regenerate (via ?refresh=1)
        const forceRefresh = url.searchParams.get('refresh') === '1'

        // ─────────────────────────────────────────────────────────────────────
        // 7. Jika PDF sudah ada dan tidak diminta refresh → langsung serve
        // ─────────────────────────────────────────────────────────────────────
        if (!forceRefresh) {
            try {
                await fs.access(savedPdfPath)
                const existingPdf = await fs.readFile(savedPdfPath)
                console.log(`[Sertifikat] Serving existing PDF: ${savedPdfPath}`)
                return new NextResponse(new Uint8Array(existingPdf), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `inline; filename="sertifikat-${webinarId}.pdf"`,
                        'Cache-Control': 'no-store, no-cache, must-revalidate',
                    },
                })
            } catch {
                // File belum ada, lanjutkan generate
            }
        } else {
            // Hapus PDF lama agar tidak serve file stale dari percobaan gagal sebelumnya
            await fs.unlink(savedPdfPath).catch(() => {})
            console.log(`[Sertifikat] Deleted stale PDF for fresh generation: ${savedPdfPath}`)
        }

        // ─────────────────────────────────────────────────────────────────────
        // 8. Generate PDF dari template
        // ─────────────────────────────────────────────────────────────────────
        const valNomor = nomor_sertifikat
        const valNama  = user.nama
        const valNip   = `NIP. ${user.nip}`
        const valJabatan = user.jabatan || ''
        const valOpd   = user.unit_kerja || 'Surajaya Corpu'

        const templatePath  = path.join(process.cwd(), 'public', webinar.template_sertifikat)
        const templateBytes = await fs.readFile(templatePath)

        // ── Cabang DOCX ──────────────────────────────────────────────────────
        if (webinar.template_sertifikat.toLowerCase().endsWith('.docx')) {
            const PizZip        = require('pizzip')
            const Docxtemplater = require('docxtemplater')

            const zip = new PizZip(templateBytes)

            // Data yang akan diisi ke template
            const templateData: Record<string, string> = {
                nama: valNama,
                nip: valNip,
                jabatan: valJabatan,
                opd: valOpd,
                nomor: valNomor,
                nomer: valNomor,
                name: valNama,
                date: new Date().toLocaleDateString('id-ID'),
            }

            // XML files containing text/tags in standard Word Document structure
            const xmlFiles = [
                'word/document.xml',
                'word/header1.xml', 'word/header2.xml', 'word/header3.xml',
                'word/footer1.xml', 'word/footer2.xml', 'word/footer3.xml',
            ]

            for (const file of xmlFiles) {
                const f = zip.file(file)
                if (!f) continue
                
                const rawText = f.asText()
                if (file === 'word/document.xml') {
                    console.log(`[DOCX Diagnostic] Raw XML length: ${rawText.length}`)
                    
                    // Match braces that might contain XML tags inside
                    const rawMatches = rawText.match(/\{[^{}]*\}/g) || []
                    console.log(`[DOCX Diagnostic] Raw braces:`, rawMatches.slice(0, 30))
                }

                // Normalize split XML tags to standard {curly_brace} formatting for docxtemplater
                const processed = prepareXmlForTemplating(rawText)
                
                if (file === 'word/document.xml') {
                    const processedMatches = processed.match(/\{[^{}]*\}/g) || []
                    console.log(`[DOCX Diagnostic] Processed braces:`, processedMatches.slice(0, 30))
                }

                zip.file(file, processed)
            }

            // docxtemplater uses default {tag} delimiters — handles any remaining split tags natively
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
            doc.render(templateData)

            const docxBuffer: Buffer = doc.getZip().generate({ type: 'nodebuffer' })

            // Direktori temp untuk proses konversi
            const tempDir = path.join(process.cwd(), 'temp')
            await fs.mkdir(tempDir, { recursive: true })

            const uniqueId = `${webinarId}-${userId}-${Date.now()}`

            console.log(`[Sertifikat] Filled DOCX size: ${docxBuffer.length} bytes — converting to PDF...`)

            // Konversi DOCX → PDF via LibreOffice / Fallbacks
            const pdfBuffer = await convertDocxToPdf(docxBuffer, tempDir, uniqueId)

            if (pdfBuffer && pdfBuffer.length > 1000) {
                // Simpan PDF ke public/sertifikat/
                await fs.writeFile(savedPdfPath, pdfBuffer)
                console.log(`[Sertifikat] PDF saved to: ${savedPdfPath}`)

                return new NextResponse(new Uint8Array(pdfBuffer), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `inline; filename="sertifikat-${webinarId}.pdf"`,
                        'Cache-Control': 'no-store, no-cache, must-revalidate',
                    },
                })
            }

            // Jika konversi gagal → kembalikan DOCX (fallback)
            console.warn('[Sertifikat] All PDF conversion stages failed. Returning DOCX as fallback.')
            return new NextResponse(new Uint8Array(docxBuffer), {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="sertifikat-${webinarId}.docx"`,
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            })
        }

        // ── Cabang PDF / Gambar ──────────────────────────────────────────────
        const { PDFDocument, rgb, StandardFonts } = await getPdfLib()

        let pdfDoc: any
        let firstPage: any
        let width  = 842
        let height = 595
        const lowerTpl = webinar.template_sertifikat.toLowerCase()
        const isPdf    = lowerTpl.endsWith('.pdf')

        if (isPdf) {
            // Load the source template PDF document
            const sourcePdf = await PDFDocument.load(templateBytes)
            
            // Create a completely new PDF document to isolate Z-order layers
            pdfDoc = await PDFDocument.create()
            
            // Embed the first page of the source PDF template
            const [embeddedPage] = await pdfDoc.embedPdf(sourcePdf, [0])
            
            // Get dimensions of the first page from the source PDF
            const sourcePage = sourcePdf.getPages()[0]
            const dims = sourcePage.getSize()
            width  = dims.width
            height = dims.height
            
            // Add a new page to our destination PDF with identical dimensions
            firstPage = pdfDoc.addPage([width, height])
            
            // Draw the embedded template page onto the new page as a background first
            firstPage.drawPage(embeddedPage, { x: 0, y: 0, width, height })
        } else {
            pdfDoc    = await PDFDocument.create()
            firstPage = pdfDoc.addPage([width, height])

            let embeddedImage
            if (lowerTpl.endsWith('.png')) {
                embeddedImage = await pdfDoc.embedPng(templateBytes)
            } else if (lowerTpl.endsWith('.jpg') || lowerTpl.endsWith('.jpeg')) {
                embeddedImage = await pdfDoc.embedJpg(templateBytes)
            } else {
                throw new Error('Format template tidak didukung.')
            }

            firstPage.drawImage(embeddedImage, { x: 0, y: 0, width, height })
        }

        const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

        /**
         * Draw centered text pada PDF certificate
         * 
         * Fitur:
         * - Center horizontal alignment
         * - Customizable color (default: white untuk better visibility)
         * - Optional text outline/shadow untuk clarity
         * - Debug logging untuk track actual positioning
         * 
         * @param text - Text to draw
         * @param y - Y coordinate (in PDF points, 0 = bottom)
         * @param font - PDF font object
         * @param size - Font size in points
         * @param textColor - RGB color (default: white)
         * @param options - Additional rendering options
         */
        const drawCentered = (
            text: string,
            y: number,
            font: any,
            size: number,
            textColor = rgb(1, 1, 1), // WHITE sebagai default (lebih visible)
            options?: {
                shadowColor?: any
                shadowOffset?: number
                outlineWidth?: number
                outlineColor?: any
            }
        ) => {
            const w = font.widthOfTextAtSize(text, size)
            const xCenter = (width - w) / 2

            // Debug logging untuk track positioning
            console.log(`[Sertifikat Text] "${text}" | Y: ${y.toFixed(1)}px (${(y / height * 100).toFixed(1)}% dari height) | Size: ${size}pt | X: ${xCenter.toFixed(1)}`)

            // Optional: Draw shadow untuk depth & readability
            if (options?.shadowOffset) {
                const shadowColor = options.shadowColor || rgb(0, 0, 0)
                firstPage.drawText(text, {
                    x: xCenter + options.shadowOffset,
                    y: y - options.shadowOffset,
                    font,
                    size,
                    color: shadowColor,
                    opacity: 0.3
                })
            }

            // Draw main text dengan warna yang visible
            firstPage.drawText(text, {
                x: xCenter,
                y,
                font,
                size,
                color: textColor
            })
        }

        // Text positioning dengan better visibility
        // ────────────────────────────────────────
        // Nomor Sertifikat - top area, small font
        drawCentered(
            valNomor,
            height * 0.72,
            fontRegular,
            10,
            rgb(1, 1, 1), // White
            { shadowOffset: 1 }
        )

        // Nama Peserta - main content area, large & bold
        drawCentered(
            valNama,
            height * 0.52,
            fontBold,
            22,
            rgb(1, 1, 1), // White
            { shadowOffset: 1 }
        )

        // NIP - supporting info
        drawCentered(
            valNip,
            height * 0.45,
            fontRegular,
            12,
            rgb(1, 1, 1), // White
            { shadowOffset: 0.5 }
        )

        // Jabatan - supporting info
        if (valJabatan) {
            drawCentered(
                valJabatan,
                height * 0.42,
                fontRegular,
                12,
                rgb(1, 1, 1), // White
                { shadowOffset: 0.5 }
            )
        }

        // OPD - supporting info
        drawCentered(
            valOpd,
            height * 0.40,
            fontRegular,
            12,
            rgb(1, 1, 1), // White
            { shadowOffset: 0.5 }
        )

        const pdfBytes  = await pdfDoc.save()
        const pdfBuffer = Buffer.from(pdfBytes)

        // Simpan ke public/sertifikat/
        await fs.writeFile(savedPdfPath, pdfBuffer)
        console.log(`[Sertifikat] PDF (image/pdf template) saved to: ${savedPdfPath}`)

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="sertifikat-${webinarId}.pdf"`,
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        })

    } catch (err: any) {
        console.error('[Sertifikat PDF] Error:', err)
        return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: 500 })
    }
}
