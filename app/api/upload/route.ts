import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ message: 'Tidak ada file yang diunggah' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate a unique filename
        const originalName = file.name
        const extension = originalName.split('.').pop()
        const fileName = `${uuidv4()}.${extension}`

        const path = join(process.cwd(), 'public', 'uploads', 'webinars', fileName)
        await writeFile(path, buffer)

        // Return the public URL
        const url = `/uploads/webinars/${fileName}`

        return NextResponse.json({
            success: true,
            url
        })
    } catch (error) {
        console.error('File Upload Error:', error)
        return NextResponse.json({
            message: 'Terjadi kesalahan saat mengunggah file'
        }, { status: 500 })
    }
}
