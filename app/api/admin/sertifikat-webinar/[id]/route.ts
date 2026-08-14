import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { sertifikatWebinarTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const decoded = await verifyToken(token)
        if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
        if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const sertifikatId = parseInt(id)
        if (isNaN(sertifikatId)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }

        const result = await db.delete(sertifikatWebinarTable)
            .where(eq(sertifikatWebinarTable.id, sertifikatId))
            .returning()

        if (result.length === 0) {
            return NextResponse.json({ message: 'Sertifikat tidak ditemukan' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Sertifikat berhasil dihapus' })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem'
        return NextResponse.json({ message: 'Terjadi kesalahan sistem', error: message }, { status: 500 })
    }
}
