import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siasnSyncQueueTable, siasnRiwayatSyncTable } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    const start = Date.now()
    // quick check: try OAuth token fetch (without full data-utama)
    let oauthOk = false
    let oauthMsg = ''
    try {
      const { siasnService } = await import('@/lib/services/siasn.service')
      await (siasnService as any).getOAuthToken()
      oauthOk = true
    } catch (e: any) { oauthMsg = e.message }

    const pendingAsn = await db.select({ c: sql<number>`count(*)` }).from(siasnSyncQueueTable).where(sql`${siasnSyncQueueTable.status} = 'pending'`)
    const pendingKursus = await db.select({ c: sql<number>`count(*)` }).from(siasnRiwayatSyncTable).where(sql`${siasnRiwayatSyncTable.status} = 'queued_simegilan'`)
    const filesPending = await db.select({ c: sql<number>`count(*)` }).from(siasnRiwayatSyncTable).where(sql`${siasnRiwayatSyncTable.status} = 'synced' AND ${siasnRiwayatSyncTable.error_msg} LIKE 'FILE_PENDING:%'`)
    const latency = Date.now() - start

    return NextResponse.json({
      success: true,
      siasn_oauth: oauthOk ? 'up' : `down: ${oauthMsg.slice(0, 200)}`,
      latency_ms: latency,
      pending_asn_queue: Number((pendingAsn[0] as any)?.c || 0),
      pending_riwayat_queue: Number((pendingKursus[0] as any)?.c || 0),
      files_pending_upload: Number((filesPending[0] as any)?.c || 0),
      fallback_available: 'simegilan.siasn_data_utama',
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
