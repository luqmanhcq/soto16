import { NextRequest, NextResponse } from 'next/server'
import { withRole } from '@/lib/middleware/auth'
import { siasnKursusService } from '@/lib/services/siasn-kursus.service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * POST /api/admin/webinar/[id]/siasn-bulk/files
 * Susulkan file PDF untuk semua baris FILE_PENDING (data sudah di SIASN, file belum).
 * Hanya memproses yang PDF aslinya kini sudah ada; sisanya tetap pending + dilaporkan.
 */
export async function POST(request: NextRequest) {
  const roleError = await withRole(request, ['admin', 'super_admin'])
  if (roleError) return roleError
  try {
    const body = await request.json().catch(() => ({}))
    const limit = Math.min(Number(body.limit || 50), 200)
    const result = await siasnKursusService.retryPendingFiles(limit)
    return NextResponse.json({ success: true, ...result })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Gagal susulan file' }, { status: 500 })
  }
}
