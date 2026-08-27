import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory store untuk rate limiting
// Untuk production multi-instance, gunakan Redis atau sejenisnya
interface RateLimitItem {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitItem>()
const DEFAULT_WINDOW_MS = 60 * 1000 // 1 menit
const DEFAULT_MAX_REQUESTS = 5

/**
 * Rate limiter sederhana berbasis identifier (mis. IP + endpoint).
 * @returns NextResponse 429 jika melebihi batas, null jika diizinkan
 */
export function rateLimit(
  identifier: string,
  windowMs: number = DEFAULT_WINDOW_MS,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
): NextResponse | null {
  const now = Date.now()
  const item = rateLimitMap.get(identifier)

  if (item) {
    if (now < item.resetTime) {
      item.count++

      if (item.count > maxRequests) {
        const retryAfter = Math.ceil((item.resetTime - now) / 1000)
        return NextResponse.json(
          { success: false, message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
          {
            status: 429,
            headers: { 'Retry-After': retryAfter.toString() },
          }
        )
      }
    } else {
      // Window kadaluarsa, reset
      item.count = 1
      item.resetTime = now + windowMs
    }
  } else {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
  }

  return null
}

// Bersihkan entri yang sudah kadaluarsa setiap menit agar memori tidak menumpuk
if (typeof setInterval !== 'undefined') {
  const cleaner = setInterval(() => {
    const now = Date.now()
    for (const [key, item] of rateLimitMap.entries()) {
      if (item.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }
  }, 60 * 1000)
  if (cleaner && typeof cleaner === 'object' && 'unref' in cleaner) {
    ;(cleaner as NodeJS.Timeout).unref()
  }
}

/**
 * Ambil IP klien dari header proxy umum.
 */
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}
