import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromCookie } from '@/lib/jwt'
import { siasnKursusService } from '@/lib/services/siasn-kursus.service'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromCookie(request.headers.get('cookie')) || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ success: false, message: 'Token tidak valid' }, { status: 401 })

    const form = await request.formData()
    const sumber_type = String(form.get('sumber_type') || form.get('type') || '')
    const sumber_id = Number(form.get('sumber_id') || form.get('id') || 0)
    const file = form.get('file') as File | null
    if (!sumber_type || !sumber_id) return NextResponse.json({ success: false, message: 'sumber_type & sumber_id wajib' }, { status: 400 })
    if (!['webinar', 'pembelajaran'].includes(sumber_type)) return NextResponse.json({ success: false, message: 'sumber_type harus webinar|pembelajaran' }, { status: 400 })
    if (!file) return NextResponse.json({ success: false, message: 'file PDF wajib' }, { status: 400 })
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) return NextResponse.json({ success: false, message: 'File harus PDF' }, { status: 400 })
    if (file.size > 1024 * 1024) return NextResponse.json({ success: false, message: 'File terlalu besar, max 1MB' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const res = await siasnKursusService.uploadFileForRiwayat(decoded.id, sumber_type as any, sumber_id, buffer, file.name)
    if (!res.ok) return NextResponse.json({ success: false, message: res.message || 'Gagal upload dokumen' }, { status: 500 })
    return NextResponse.json({ success: true, message: 'Dokumen berhasil diupload ke SIASN' })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Gagal upload' }, { status: 500 })
  }
}
