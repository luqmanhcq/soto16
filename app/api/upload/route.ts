import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { withRole } from '@/lib/middleware/auth'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_PDF_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_WIDTH = 1600
const WEBP_QUALITY = 80

export async function POST(request: NextRequest) {
    // Hanya admin yang boleh mengunggah file
    const roleError = await withRole(request, ['admin', 'super_admin'])
    if (roleError) return roleError

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ message: 'Tidak ada file yang diunggah' }, { status: 400 })
        }

        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
        const isPdf = file.type === 'application/pdf'

        if (!isImage && !isPdf) {
            return NextResponse.json(
                { message: 'Tipe file tidak diizinkan. Gunakan JPG, PNG, WebP, GIF, atau PDF.' },
                { status: 400 }
            )
        }

        if (isImage && file.size > MAX_IMAGE_SIZE) {
            return NextResponse.json(
                { message: 'Ukuran gambar terlalu besar. Maksimal 5 MB.' },
                { status: 400 }
            )
        }

        if (isPdf && file.size > MAX_PDF_SIZE) {
            return NextResponse.json(
                { message: 'Ukuran PDF terlalu besar. Maksimal 20 MB.' },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        let fileName: string
        let output: Buffer

        if (isImage) {
            // Optimasi gambar: resize + konversi ke WebP untuk ukuran lebih kecil
            output = await sharp(buffer)
                .rotate() // hormati orientasi EXIF
                .resize({ width: MAX_WIDTH, withoutEnlargement: true })
                .webp({ quality: WEBP_QUALITY })
                .toBuffer()
            fileName = `${uuidv4()}.webp`
        } else {
            // PDF disimpan apa adanya (validasi magic number %PDF)
            const header = buffer.subarray(0, 5).toString('ascii')
            if (header !== '%PDF-') {
                return NextResponse.json({ message: 'File bukan PDF yang valid.' }, { status: 400 })
            }
            output = buffer
            fileName = `${uuidv4()}.pdf`
        }

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'webinars')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch {
            // Ignore if exists
        }

        await writeFile(join(uploadDir, fileName), output)

        return NextResponse.json({
            success: true,
            url: `/uploads/webinars/${fileName}`
        })
    } catch (error) {
        console.error('File Upload Error:', error)
        return NextResponse.json({
            message: 'Terjadi kesalahan saat mengunggah file'
        }, { status: 500 })
    }
}
