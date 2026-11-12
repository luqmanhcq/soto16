import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromCookie } from '@/lib/jwt'
import { db } from '@/lib/db'
import { siasnRiwayatSyncTable } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromCookie(request.headers.get('cookie')) || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ success: false, message: 'Token tidak valid' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const sumber_type = searchParams.get('sumber_type') as 'webinar' | 'pembelajaran' | null
    const sumber_id = searchParams.get('sumber_id')
    const webinar_id = searchParams.get('webinar_id')

    let type = sumber_type
    let sid = sumber_id ? Number(sumber_id) : null
    if (!type && webinar_id) { type = 'webinar'; sid = Number(webinar_id) }
    if (!type || !sid) return NextResponse.json({ success: false, message: 'sumber_type & sumber_id / webinar_id wajib' }, { status: 400 })

    // resolve webinar_id -> sertifikat id
    let targetId = sid
    if (type === 'webinar') {
      const { sertifikatWebinarTable } = await import('@/lib/db/schema')
      const bySertifikat = await db.select().from(sertifikatWebinarTable).where(eq(sertifikatWebinarTable.id, sid)).limit(1)
      if (bySertifikat.length === 0) {
        const byUserWebinar = await db.select().from(sertifikatWebinarTable).where(and(eq(sertifikatWebinarTable.user_id, decoded.id), eq(sertifikatWebinarTable.webinar_id, sid))).limit(1)
        if (byUserWebinar.length > 0) targetId = byUserWebinar[0].id
        else return NextResponse.json({ success: true, data: null })
      } else {
        // if sertifikat exists but belongs to other user and caller is admin, allow
        if (bySertifikat[0].user_id !== decoded.id && !['admin', 'super_admin'].includes(decoded.role)) {
          return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
        }
        // for owner lookup, use sertifikat owner id
        const ownerId = bySertifikat[0].user_id
        const rows = await db.select().from(siasnRiwayatSyncTable).where(and(eq(siasnRiwayatSyncTable.user_id, ownerId), eq(siasnRiwayatSyncTable.sumber_type, type as any), eq(siasnRiwayatSyncTable.sumber_id, targetId))).limit(1)
        return NextResponse.json({ success: true, data: rows[0] || null })
      }
    }

    const rows = await db.select().from(siasnRiwayatSyncTable).where(and(eq(siasnRiwayatSyncTable.user_id, decoded.id), eq(siasnRiwayatSyncTable.sumber_type, type as any), eq(siasnRiwayatSyncTable.sumber_id, targetId))).limit(1)
    return NextResponse.json({ success: true, data: rows[0] || null })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
