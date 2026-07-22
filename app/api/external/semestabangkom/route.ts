import { NextResponse } from 'next/server'
import { fetchSemestaNative } from '@/lib/services/semesta-native.service'

export async function GET() {
  try {
    const res = await fetchSemestaNative()
    if (res.status === 'ok') return NextResponse.json(res)
    return NextResponse.json(res, { status: 502 })
  } catch (err: any) {
    console.error('[ExternalSemesta] Error', err)
    return NextResponse.json({ status: 'error', error: err.message || String(err) }, { status: 500 })
  }
}
