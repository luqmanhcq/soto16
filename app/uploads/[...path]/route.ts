import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join, normalize } from 'path'
import { existsSync } from 'fs'

/**
 * Route handler to serve uploaded files.
 * This is necessary because in some production environments, 
 * files added to the public folder at runtime are not immediately served by Next.js.
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await context.params
    
    // Prevent path traversal
    if (pathSegments.some(segment => segment === '..' || segment.includes('/') || segment.includes('\\'))) {
        return new NextResponse('Invalid path', { status: 400 })
    }

    const relativePath = pathSegments.join('/')
    const rootDir = join(process.cwd(), 'public', 'uploads')
    const filePath = normalize(join(rootDir, relativePath))

    // Ensure the resolved path is still within the root directory
    const normalizedRoot = normalize(rootDir)
    if (!filePath.startsWith(normalizedRoot)) {
        return new NextResponse('Access denied', { status: 403 })
    }

    if (!existsSync(filePath)) {
        return new NextResponse('File not found', { status: 404 })
    }

    try {
        const fileBuffer = await readFile(filePath)
        const extension = relativePath.split('.').pop()?.toLowerCase()
        
        let contentType = 'application/octet-stream'
        const mimeTypes: { [key: string]: string } = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }

        if (extension && mimeTypes[extension]) {
            contentType = mimeTypes[extension]
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Serve Upload Error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
