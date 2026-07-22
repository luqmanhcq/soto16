import { NextRequest, NextResponse } from 'next/server'
import { fetchSemestaNative, fetchExternalHtmlNative, type WebinarItem } from '@/lib/services/semesta-native.service'

// ─── Source Configuration ───────────────────────────────────────────────────

const SOURCES: Record<string, { label: string; type: 'semestabangkom' | 'generic' }> = {
  semestabangkom: { label: 'Semestabangkom', type: 'semestabangkom' },
  lan:            { label: 'LAN',            type: 'generic' },
  website_lainnya:{ label: 'Website Lainnya', type: 'generic' },
}

// ─── Normalizer ─────────────────────────────────────────────────────────────

function normalizeItem(item: WebinarItem, source: string, index: number) {
  return {
    id: `ext-${source}-${index}`,
    nama_webinar: item.title || 'Webinar Eksternal',
    deskripsi: item.description || 'Detail webinar tersedia di sumber terkait.',
    kategori: item.badge || item.jp || 'UMUM',
    sumber: source,
    sumber_label: SOURCES[source]?.label || source,
    gambar: item.image || '',
    link: item.link || '',
    status: item.status || '',
    tanggal: item.dateRange || '',
    waktu: item.timeRange || '',
    penyelenggara: item.organizer || '',
    subtitle: item.subtitle || '',
    jp: item.jp || '',
  }
}

// ─── GET /api/webinar/eksternal ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = (searchParams.get('source') || 'semestabangkom').toLowerCase()
    const sourceConfig = SOURCES[source]

    if (!sourceConfig) {
      return NextResponse.json(
        { success: false, message: 'Sumber tidak didukung' },
        { status: 400 }
      )
    }

    let result
    if (sourceConfig.type === 'semestabangkom') {
      result = await fetchSemestaNative()
    } else {
      const url = searchParams.get('url')
      if (!url) {
        return NextResponse.json(
          { success: false, message: `URL sumber ${sourceConfig.label} tidak ditemukan` },
          { status: 400 }
        )
      }
      result = await fetchExternalHtmlNative(url)
    }

    if (result.status !== 'ok') {
      console.error('[API] External webinar fetch failed:', result.error)
      return NextResponse.json(
        { success: false, message: result.error || 'Gagal mengambil data webinar eksternal' },
        { status: 502 }
      )
    }

    const rawItems = result.data || []
    console.log('[API] External webinar items:', rawItems.length, '| source:', source)

    const normalized = rawItems.map((item, index) => normalizeItem(item, source, index))

    return NextResponse.json({
      success: true,
      message: 'Data webinar eksternal berhasil diambil',
      data: normalized,
      total: normalized.length,
      source,
      source_label: sourceConfig.label,
    })
  } catch (err: any) {
    console.error('[API] Webinar Eksternal Error:', err)
    return NextResponse.json(
      { success: false, message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
