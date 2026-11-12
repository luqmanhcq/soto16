import { NextRequest, NextResponse } from 'next/server'
import { withRole } from '@/lib/middleware/auth'
import { siasnBulkService } from '@/lib/services/siasn-bulk.service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * GET /api/admin/webinar/[id]/siasn-bulk → preview/laporan (tanpa efek samping)
 * GET /api/admin/webinar/[id]/siasn-bulk?stream=1 → SSE progress saat sinkron all berjalan
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const roleError = await withRole(request, ['admin', 'super_admin'])
  if (roleError) return roleError
  try {
    const { id } = await params
    const webinarId = parseInt(id)
    if (isNaN(webinarId)) return NextResponse.json({ success: false, message: 'ID tidak valid' }, { status: 400 })

    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === '1'

    if (searchParams.get('stream') === '1') {
      const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '10')), 50)
      const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))
      const onlyFailed = searchParams.get('onlyFailed') === '1'
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          const send = (obj: any) => {
            try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)) } catch {}
          }
          // Anjurkan EventSource tidak reconnect agresif; heartbeat cegah proxy memutus koneksi idle
          try { controller.enqueue(encoder.encode('retry: 8000\n\n')) } catch {}
          const hb = setInterval(() => {
            try { controller.enqueue(encoder.encode(': ping\n\n')) } catch {}
          }, 15000)
          try {
            const result = await siasnBulkService.syncAllWebinar(
              webinarId,
              async (ev) => { send({ type: 'progress', ...ev }) },
              { force, limit, offset, onlyFailed },
            )
            send({ type: 'done', summary: result.summary, rows: result.rows, webinar: result.webinar, total: result.total, offset: result.offset, limit: result.limit, hasMore: result.hasMore, nextOffset: result.nextOffset })
          } catch (e: any) {
            send({ type: 'error', message: e.message || 'Gagal sinkron' })
          } finally {
            clearInterval(hb)
            try { controller.close() } catch {}
          }
        },
      })
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })
    }

    const preview = await siasnBulkService.previewWebinar(webinarId)
    return NextResponse.json({ success: true, ...preview })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Gagal memuat' }, { status: 500 })
  }
}

/**
 * POST /api/admin/webinar/[id]/siasn-bulk → jalankan sinkron all, return laporan akhir (tanpa stream)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const roleError = await withRole(request, ['admin', 'super_admin'])
  if (roleError) return roleError
  try {
    const { id } = await params
    const webinarId = parseInt(id)
    if (isNaN(webinarId)) return NextResponse.json({ success: false, message: 'ID tidak valid' }, { status: 400 })
    const body = await request.json().catch(() => ({}))
    const result = await siasnBulkService.syncAllWebinar(webinarId, undefined, {
      force: body.force === true,
      limit: body.limit ? Math.min(Math.max(1, Number(body.limit)), 200) : undefined,
      offset: body.offset ? Math.max(0, Number(body.offset)) : undefined,
      onlyFailed: body.onlyFailed === true,
    })
    return NextResponse.json({ success: true, ...result })
  } catch (e: any) {
    const status = /belum selesai/.test(e.message || '') ? 400 : 500
    return NextResponse.json({ success: false, message: e.message || 'Gagal sinkron' }, { status })
  }
}
