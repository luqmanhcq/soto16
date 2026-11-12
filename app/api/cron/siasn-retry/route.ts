import { NextRequest, NextResponse } from 'next/server'
import { siasnService } from '@/lib/services/siasn.service'
import { siasnKursusService } from '@/lib/services/siasn-kursus.service'

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // allow if not configured
  const header = req.headers.get('x-cron-secret') || req.headers.get('authorization')?.replace('Bearer ', '')
  const urlSecret = new URL(req.url).searchParams.get('secret')
  return header === cronSecret || urlSecret === cronSecret
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ success: false, message: 'Unauthorized cron' }, { status: 401 })
  try {
    const body = await request.json().catch(() => ({}))
    const limit = Number(body.limit || 20)
    const asnDone = await siasnService.retryPendingQueue(limit)
    const kursusDone = await siasnKursusService.retryPending(limit)
    const files = await siasnKursusService.retryPendingFiles(limit)
    return NextResponse.json({ success: true, asn_retried: asnDone, kursus_retried: kursusDone, files_susul: files.done, files_still_pending: files.still_pending })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
