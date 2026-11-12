import { db } from '@/lib/db'
import {
  webinarsTable,
  webinarParticipantsTable,
  usersTable,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import fs from 'fs/promises'
import path from 'path'

// Server-only service (menggunakan fs/child_process). Jangan diimpor komponen client.

async function getPdfLib() {
  try {
    return await import('pdf-lib')
  } catch {
    throw new Error('Pustaka pdf-lib belum terinstall.')
  }
}

function nodeRequire(id: string): any {
  // eslint-disable-next-line no-eval
  const req = eval('require') as (m: string) => any
  return req(id)
}

/**
 * Prepare DOCX XML for docxtemplater (default {tag} delimiters).
 * (Dipindah dari app/api/webinar/[id]/sertifikat/pdf/route.ts — logika identik)
 */
export function prepareXmlForTemplating(xmlText: string): string {
  let cleaned = xmlText
    .replace(/<w:proofErr[^/]*\/>/g, '')
    .replace(/<w:noProof\s*\/>/g, '')
    .replace(/<w:noProof>[^<]*<\/w:noProof>/g, '')

  cleaned = cleaned.replace(/(\{)([^{}]+)(\})/g, (match, open, content, close) => {
    if (content.includes('<') && content.includes('>')) {
      const plainText = content.replace(/<[^>]+>/g, '').trim()
      return `{${plainText}}`
    }
    return match
  })

  cleaned = cleaned.replace(/(\[)\s*(<[^>]+>\s*)*([a-zA-Z_][a-zA-Z0-9_]*)\s*(<[^>]+>\s*)*(\])/g, (match, _open, _beforeTag, tag, _afterTag, _close) => {
    if (match.includes('<') && match.includes('>')) {
      return `[${tag}]`
    }
    return match
  })

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

  cleaned = cleaned.replace(/<wp:anchor\b[^>]*behindDoc="false"[^>]*>[\s\S]*?<\/wp:anchor>/g, (anchor) => {
    if (anchor.includes('<pic:pic') || anchor.includes('<a:blip')) {
      return anchor.replace(/behindDoc="false"/, 'behindDoc="true"')
    }
    return anchor
  })

  return cleaned
}

// Convert DOCX buffer → PDF Buffer (multi-stage pipeline, logika identik dengan route)
export async function convertDocxToPdf(docxBuffer: Buffer, workDir: string, uniqueId: string): Promise<Buffer | null> {
  const { promisify } = nodeRequire('util')
  const { exec: _exec } = nodeRequire('child_process')
  const execAsync = promisify(_exec)

  const tempDocx = path.join(workDir, `cert-${uniqueId}.docx`)
  const tempPdf = path.join(workDir, `cert-${uniqueId}.pdf`)
  const userProfileDir = path.join(workDir, `lo-${uniqueId}`)

  await fs.writeFile(tempDocx, docxBuffer)

  let pdfBuffer: Buffer | null = null

  try {
    await fs.mkdir(userProfileDir, { recursive: true })
    const userProfileUrl = `file:///${userProfileDir.replace(/\\/g, '/')}`
    const sofficePaths = [
      'soffice',
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    ]
    for (const sof of sofficePaths) {
      try {
        const cmd = `"${sof}" --headless "-env:UserInstallation=${userProfileUrl}" --convert-to pdf --outdir "${workDir}" "${tempDocx}"`
        await execAsync(cmd, { timeout: 60000 })
        const baseName = path.basename(tempDocx, '.docx')
        const generatedPdf = path.join(workDir, `${baseName}.pdf`)
        if (generatedPdf !== tempPdf) {
          try { await fs.rename(generatedPdf, tempPdf) } catch { /* ok */ }
        }
        await fs.access(tempPdf)
        pdfBuffer = await fs.readFile(tempPdf)
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

  if (!pdfBuffer) {
    try {
      const libre = nodeRequire('libreoffice-convert')
      const convertAsync = promisify(libre.convert)
      const res = await convertAsync(docxBuffer, '.pdf', undefined)
      if (res && res.length > 1000) pdfBuffer = res
    } catch (e: any) {
      console.error(`[PDF Convert] Stage 2 error: ${e.message}`)
    }
  }

  if (!pdfBuffer) {
    try {
      const docxToPdf = nodeRequire('docx-pdf')
      await new Promise<void>((resolve, reject) => {
        docxToPdf(tempDocx, tempPdf, (err: any) => {
          if (err) reject(err); else resolve()
        })
      })
      await fs.access(tempPdf)
      pdfBuffer = await fs.readFile(tempPdf)
    } catch (e: any) {
      console.error(`[PDF Convert] Stage 3 error: ${e.message}`)
    }
  }

  await fs.unlink(tempDocx).catch(() => {})
  await fs.unlink(tempPdf).catch(() => {})

  return pdfBuffer
}

export type EnsuredPdf = { buffer: Buffer; fileName: string; fromCache: boolean }

/**
 * Pastikan file PDF sertifikat webinar ada untuk user:
 * - kembalikan file yang sudah ada bila tersedia
 * - bila belum: generate dari template (docx/pdf/image, sama persis seperti route PDF),
 *   simpan ke public/sertifikat/<webinarId>-<userId>.pdf, lalu kembalikan.
 * Return null bila tidak bisa (tanpa template / bukan peserta / generate gagal).
 * Dipakai route PDF maupun bulk-sync SIASN.
 */
export async function ensureWebinarCertificatePdf(webinarId: number, userId: number): Promise<EnsuredPdf | null> {
  const [webinar] = await db.select().from(webinarsTable).where(eq(webinarsTable.id, webinarId))
  if (!webinar || !webinar.template_sertifikat) return null

  let [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId))
  if (!user) return null
  if (!user.jabatan || !user.golongan || !user.unit_kerja) {
    const { siasnService } = await import('@/lib/services/siasn.service')
    await siasnService.syncAsnData(userId, user.nip)
    const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, userId))
    if (updated) user = updated
  }

  const [participant] = await db.select().from(webinarParticipantsTable).where(
    and(eq(webinarParticipantsTable.user_id, userId), eq(webinarParticipantsTable.webinar_id, webinarId))
  )
  if (!participant) return null

  let nomor_sertifikat = participant.nomor_sertifikat
  if (!nomor_sertifikat) {
    const { sertifikatWebinarService } = await import('@/lib/services/sertifikat-webinar.service')
    nomor_sertifikat = await sertifikatWebinarService.generateNomorSertifikat(webinarId)
    await db.update(webinarParticipantsTable).set({ nomor_sertifikat }).where(eq(webinarParticipantsTable.id, participant.id))
    await sertifikatWebinarService.createOrUpdate(userId, webinarId, nomor_sertifikat)
  }

  const sertifikatDir = path.join(process.cwd(), 'public', 'sertifikat')
  await fs.mkdir(sertifikatDir, { recursive: true })
  const savedPdfFileName = `${webinarId}-${userId}.pdf`
  const savedPdfPath = path.join(sertifikatDir, savedPdfFileName)

  try {
    await fs.access(savedPdfPath)
    const existingPdf = await fs.readFile(savedPdfPath)
    if (existingPdf.length > 1000) return { buffer: existingPdf, fileName: savedPdfFileName, fromCache: true }
  } catch {
    // lanjut generate
  }

  const valNomor = nomor_sertifikat
  const valNama = user.nama
  const valNip = `NIP. ${user.nip}`
  const valJabatan = user.jabatan || ''
  const valOpd = user.unit_kerja || 'Surajaya Corpu'

  let templateBytes: Buffer
  try {
    templateBytes = await fs.readFile(path.join(process.cwd(), 'public', webinar.template_sertifikat))
  } catch {
    return null
  }

  // ── Cabang DOCX ──
  if (webinar.template_sertifikat.toLowerCase().endsWith('.docx')) {
    try {
      const PizZip = nodeRequire('pizzip')
      const Docxtemplater = nodeRequire('docxtemplater')
      const zip = new PizZip(templateBytes)
      const templateData: Record<string, string> = {
        nama: valNama, nip: valNip, jabatan: valJabatan, opd: valOpd,
        nomor: valNomor, nomer: valNomor, name: valNama,
        date: new Date().toLocaleDateString('id-ID'),
      }
      const xmlFiles = ['word/document.xml', 'word/header1.xml', 'word/header2.xml', 'word/header3.xml', 'word/footer1.xml', 'word/footer2.xml', 'word/footer3.xml']
      for (const file of xmlFiles) {
        const f = zip.file(file)
        if (!f) continue
        zip.file(file, prepareXmlForTemplating(f.asText()))
      }
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
      doc.render(templateData)
      const docxBuffer: Buffer = doc.getZip().generate({ type: 'nodebuffer' })

      const tempDir = path.join(process.cwd(), 'temp')
      await fs.mkdir(tempDir, { recursive: true })
      const pdfBuffer = await convertDocxToPdf(docxBuffer, tempDir, `${webinarId}-${userId}-${Date.now()}`)
      if (pdfBuffer && pdfBuffer.length > 1000) {
        await fs.writeFile(savedPdfPath, pdfBuffer)
        return { buffer: pdfBuffer, fileName: savedPdfFileName, fromCache: false }
      }
      // fallback pdf-lib sederhana (sama seperti route)
      return await generateSimpleFallbackPdf(savedPdfPath, savedPdfFileName, { valNomor, valNama, valNip, valJabatan, valOpd, webinarNama: webinar.nama_webinar || '' })
    } catch (e: any) {
      console.error('[Sertifikat] DOCX branch failed:', e.message)
      return null
    }
  }

  // ── Cabang PDF / Gambar ──
  try {
    const { PDFDocument, rgb, StandardFonts } = await getPdfLib()
    let pdfDoc: any
    let firstPage: any
    let width = 842
    let height = 595
    const lowerTpl = webinar.template_sertifikat.toLowerCase()
    if (lowerTpl.endsWith('.pdf')) {
      const sourcePdf = await PDFDocument.load(templateBytes)
      pdfDoc = await PDFDocument.create()
      const [embeddedPage] = await pdfDoc.embedPdf(sourcePdf, [0])
      const dims = sourcePdf.getPages()[0].getSize()
      width = dims.width
      height = dims.height
      firstPage = pdfDoc.addPage([width, height])
      firstPage.drawPage(embeddedPage, { x: 0, y: 0, width, height })
    } else {
      pdfDoc = await PDFDocument.create()
      firstPage = pdfDoc.addPage([width, height])
      let embeddedImage
      if (lowerTpl.endsWith('.png')) embeddedImage = await pdfDoc.embedPng(templateBytes)
      else if (lowerTpl.endsWith('.jpg') || lowerTpl.endsWith('.jpeg')) embeddedImage = await pdfDoc.embedJpg(templateBytes)
      else return null
      firstPage.drawImage(embeddedImage, { x: 0, y: 0, width, height })
    }
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const drawCentered = (text: string, y: number, font: any, size: number, textColor = rgb(1, 1, 1), shadowOffset = 0) => {
      const w = font.widthOfTextAtSize(text, size)
      const xCenter = (width - w) / 2
      if (shadowOffset) firstPage.drawText(text, { x: xCenter + shadowOffset, y: y - shadowOffset, font, size, color: rgb(0, 0, 0), opacity: 0.3 })
      firstPage.drawText(text, { x: xCenter, y, font, size, color: textColor })
    }
    drawCentered(valNomor, height * 0.72, fontRegular, 10, rgb(1, 1, 1), 1)
    drawCentered(valNama, height * 0.52, fontBold, 22, rgb(1, 1, 1), 1)
    drawCentered(valNip, height * 0.45, fontRegular, 12, rgb(1, 1, 1), 0.5)
    if (valJabatan) drawCentered(valJabatan, height * 0.42, fontRegular, 12, rgb(1, 1, 1), 0.5)
    drawCentered(valOpd, height * 0.40, fontRegular, 12, rgb(1, 1, 1), 0.5)
    const pdfBuffer = Buffer.from(await pdfDoc.save())
    await fs.writeFile(savedPdfPath, pdfBuffer)
    return { buffer: pdfBuffer, fileName: savedPdfFileName, fromCache: false }
  } catch (e: any) {
    console.error('[Sertifikat] PDF/image branch failed:', e.message)
    return null
  }
}

async function generateSimpleFallbackPdf(
  savedPdfPath: string,
  fileName: string,
  vals: { valNomor: string; valNama: string; valNip: string; valJabatan: string; valOpd: string; webinarNama: string },
): Promise<EnsuredPdf | null> {
  try {
    const { PDFDocument, rgb, StandardFonts } = await getPdfLib()
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([842, 595])
    const { width, height } = page.getSize()
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const drawCentered = (text: string, y: number, font: any, size: number, color = rgb(0.12, 0.12, 0.12)) => {
      const w = font.widthOfTextAtSize(text, size)
      page.drawText(text, { x: (width - w) / 2, y, size, font, color })
    }
    drawCentered('SERTIFIKAT', height * 0.80, bold, 28, rgb(0.05, 0.2, 0.5))
    drawCentered(vals.valNomor, height * 0.72, regular, 9, rgb(0.3, 0.3, 0.3))
    drawCentered(vals.valNama, height * 0.58, bold, 22, rgb(0.05, 0.05, 0.05))
    drawCentered(vals.valNip, height * 0.50, regular, 11, rgb(0.2, 0.2, 0.2))
    if (vals.valJabatan) drawCentered(vals.valJabatan, height * 0.46, regular, 11, rgb(0.2, 0.2, 0.2))
    drawCentered(vals.valOpd, height * 0.42, regular, 11, rgb(0.2, 0.2, 0.2))
    drawCentered(vals.webinarNama, height * 0.32, regular, 10, rgb(0.3, 0.3, 0.3))
    drawCentered(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), height * 0.18, regular, 9, rgb(0.4, 0.4, 0.4))
    const pdfBuffer = Buffer.from(await pdfDoc.save())
    await fs.writeFile(savedPdfPath, pdfBuffer).catch(() => {})
    return { buffer: pdfBuffer, fileName, fromCache: false }
  } catch {
    return null
  }
}
