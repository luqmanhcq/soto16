import { NextResponse } from 'next/server'

let cache: { data: any[]; at: number } | null = null
const TTL = 60 * 60 * 1000 // 1 jam

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < TTL) {
      return NextResponse.json({ success: true, data: cache.data, cached: true })
    }
    const res = await fetch('https://api-siasn.bkn.go.id/referensi/rumpun-jabatan-new', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`BKN ${res.status}`)
    const json = await res.json()
    if (!Array.isArray(json)) throw new Error('Format BKN tidak array')
    cache = { data: json, at: Date.now() }
    return NextResponse.json({ success: true, data: json, cached: false })
  } catch (e: any) {
    // fallback static list agar form tetap bisa dipakai saat BKN down
    const fallback = [
      { id: '11', nama: 'PERINDUSTRIAN' },
      { id: '41', nama: 'PENDIDIKAN' },
      { id: '40', nama: 'KESEHATAN' },
      { id: '70', nama: 'APARATUR NEGARA/KEPEGAWAIAN' },
      { id: '73', nama: 'KEUANGAN' },
      { id: '14', nama: 'KEHUTANAN' },
    ]
    return NextResponse.json({ success: true, data: fallback, cached: false, warning: e.message })
  }
}
