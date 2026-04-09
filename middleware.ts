import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Redirect legacy /home to root /
    if (pathname === '/home') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Define public paths that DON'T require auth
    const publicPaths = ['/', '/login', '/register', '/tentang', '/pengumuman', '/webinar', '/pembelajaran']
    const isPublicPath = publicPaths.includes(pathname) || 
        pathname.startsWith('/api/auth') || 
        pathname.startsWith('/api/webinar') ||
        pathname.startsWith('/api/pembelajaran') ||
        pathname.startsWith('/api/pengumuman') ||
        pathname.startsWith('/uploads')

    // ── Build base URL yang benar di balik reverse proxy HTTPS ───────────────
    // aaPanel reverse proxy meneruskan header x-forwarded-proto=https
    // Next.js request.url bisa saja masih http:// → kita koreksi agar redirect
    // tidak memaksa browser kembali ke http
    const proto = request.headers.get('x-forwarded-proto') ?? 
                  (request.url.startsWith('https') ? 'https' : 'http')
    const host  = request.headers.get('x-forwarded-host') ?? 
                  request.headers.get('host') ?? 
                  request.nextUrl.host
    const baseUrl = `${proto}://${host}`

    if (token) {
        // Jika sudah login, jangan biarkan akses halaman login
        if (pathname === '/login') {
            return NextResponse.redirect(new URL('/dashboard', baseUrl))
        }
        return NextResponse.next()
    }

    // Jika TIDAK memiliki token
    // Public paths boleh diakses
    if (isPublicPath) return NextResponse.next()

    // Semua route yang butuh auth → redirect ke login
    return NextResponse.redirect(new URL('/login', baseUrl))
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
    ],
}
