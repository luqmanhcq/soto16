import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromCookie } from '@/lib/jwt'
import { siasnKursusService as kursusService } from '@/lib/services/siasn-kursus.service'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromCookie(request.headers.get('cookie')) || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ success: false, message: 'Token tidak valid' }, { status: 401 })

    const body = await request.json()
    const { sumber_type, sumber_id, webinar_id, pembelajaran_id } = body
    // allow legacy keys
    const type = sumber_type || (webinar_id ? 'webinar' : pembelajaran_id ? 'pembelajaran' : null)
    const sid = sumber_id || webinar_id || pembelajaran_id
    if (!type || !sid) return NextResponse.json({ success: false, message: 'sumber_type & sumber_id wajib' }, { status: 400 })
    if (!['webinar', 'pembelajaran'].includes(type)) return NextResponse.json({ success: false, message: 'sumber_type harus webinar|pembelajaran' }, { status: 400 })

    // Untuk webinar, sid adalah sertifikat_webinar.id ATAU webinar_id (kita coba dukung keduanya)
    // Jika dikirim webinar_id, kita resolve sertifikat_webinar by user+webinar
    let targetSertifikatId: number = Number(sid)
    if (type === 'webinar') {
      // coba cek apakah sid adalah webinar_id (bukan sertifikat id)
      const { db } = await import('@/lib/db')
      const { sertifikatWebinarTable } = await import('@/lib/db/schema')
      const { eq, and } = await import('drizzle-orm')
      const bySertifikat = await db.select().from(sertifikatWebinarTable).where(eq(sertifikatWebinarTable.id, targetSertifikatId)).limit(1)
      if (bySertifikat.length === 0) {
        // anggap sid adalah webinar_id
        const byUserWebinar = await db.select().from(sertifikatWebinarTable).where(and(eq(sertifikatWebinarTable.user_id, decoded.id), eq(sertifikatWebinarTable.webinar_id, targetSertifikatId))).limit(1)
        if (byUserWebinar.length > 0) targetSertifikatId = byUserWebinar[0].id
        else return NextResponse.json({ success: false, message: 'Sertifikat webinar tidak ditemukan untuk user ini' }, { status: 404 })
      } else {
        // cek kepemilikan kecuali admin
        const ownerId = bySertifikat[0].user_id
        if (ownerId !== decoded.id && !['admin', 'super_admin'].includes(decoded.role)) {
          return NextResponse.json({ success: false, message: 'Bukan sertifikat Anda' }, { status: 403 })
        }
      }
    }

    let result
    if (type === 'webinar') result = await kursusService.syncWebinar(decoded.id, targetSertifikatId) // will query owner inside
    else result = await kursusService.syncPembelajaran(decoded.id, targetSertifikatId)

    // for admin syncing other user's cert, syncWebinar expects caller userId but payload uses sertifikat.user_id internally, so allow
    // if role admin and owner mismatch, re-call with owner id
    if (result.status === 'failed' && result.message?.includes('sertifikat')) {
      // no-op
    }

    const statusMap: Record<string, number> = { synced: 200, queued_simegilan: 202, pending: 202, failed: 500 }
    return NextResponse.json({ success: result.status === 'synced' || result.status === 'queued_simegilan', siasn_status: result.status, ...result }, { status: statusMap[result.status] || 200 })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Gagal sinkron' }, { status: 500 })
  }
}
