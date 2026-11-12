import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable, siasnSyncQueueTable } from '@/lib/db/schema'
import { eq, isNull, or } from 'drizzle-orm'
import { siasnService } from '@/lib/services/siasn.service'
import { siasnKursusService } from '@/lib/services/siasn-kursus.service'

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  const header = req.headers.get('x-cron-secret') || req.headers.get('authorization')?.replace('Bearer ', '')
  const urlSecret = new URL(req.url).searchParams.get('secret')
  return header === cronSecret || urlSecret === cronSecret
}

// Bulk prefetcher: saat SIASN bisa, sync semua user yang asn_sync_status != synced dan semua riwayat pending
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ success: false, message: 'Unauthorized cron' }, { status: 401 })
  try {
    const body = await request.json().catch(() => ({}))
    const limit = Math.min(Number(body.limit || 50), 200)
    const delayMs = Number(body.delayMs || 500)

    // 1) ASN data bulk
    const usersNeedingSync = await db.select().from(usersTable).where(or(eq(usersTable.asn_sync_status, 'pending' as any), eq(usersTable.asn_sync_status, 'failed' as any), isNull(usersTable.jabatan) as any)).limit(limit) as any
    let asnSynced = 0
    for (const u of usersNeedingSync) {
      const res = await siasnService.syncAsnData(u.id, u.nip)
      if (res) asnSynced++
      if (delayMs) await new Promise(r => setTimeout(r, delayMs))
    }

    // 2) retry queues
    const asnRetried = await siasnService.retryPendingQueue(20)
    const kursusRetried = await siasnKursusService.retryPending(20)

    return NextResponse.json({ success: true, scanned_users: usersNeedingSync.length, asn_synced: asnSynced, asn_retried: asnRetried, kursus_retried: kursusRetried })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) { return POST(request) }
