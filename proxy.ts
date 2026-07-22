import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import fs from 'fs'

function writeLog(message: string) {
    try {
        const logPath = 'c:\\wwwroot\\soto16\\proxy.log'
        const timestamp = new Date().toISOString()
        fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`)
    } catch (e) {
        // Ignore logging errors if any
    }
}

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Handles authentication guards and legacy redirects.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    writeLog(`REQ: ${pathname} | hasToken: ${!!token} | tokenVal: ${token ? token.substring(0, 15) + '...' : 'none'}`)

    // SiMEGILAN SSO: redirect /?token=xxx&role=yyy to /api/auth/sso-callback?token=xxx&role=yyy
    if (pathname === '/') {
        const ssoToken = request.nextUrl.searchParams.get('token')
        if (ssoToken) {
            const callbackUrl = new URL('/api/auth/sso-callback', request.nextUrl.origin)
            callbackUrl.searchParams.set('token', ssoToken)
            const ssoRole = request.nextUrl.searchParams.get('role')
            if (ssoRole) {
                callbackUrl.searchParams.set('role', ssoRole)
            }
            writeLog(`REDIRECT /?token=...&role=${ssoRole || 'none'} -> /api/auth/sso-callback (SiMEGILAN SSO)`)
            return NextResponse.redirect(callbackUrl)
        }
    }

    // Redirect legacy /home → /
    if (pathname === '/home') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        writeLog(`REDIRECT /home -> /`)
        return NextResponse.redirect(url)
    }

    // Public paths yang tidak memerlukan autentikasi
    const publicPaths = ['/', '/login', '/register', '/tentang', '/pengumuman', '/webinar', '/pembelajaran']
    const isPublicPath =
        publicPaths.includes(pathname) ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/webinar') ||
        pathname.startsWith('/api/pembelajaran') ||
        pathname.startsWith('/api/pengumuman') ||
        pathname.startsWith('/uploads')

    // SSO callback endpoint — always allowed (no token required, it SETS the token)
    // Already covered by pathname.startsWith('/api/auth') above, but explicit for clarity

    if (token) {
        // Sudah login, cegah akses ke /login
        if (pathname === '/login') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            writeLog(`REDIRECT /login -> /dashboard (already logged in)`)
            return NextResponse.redirect(url)
        }
        writeLog(`ALLOW (has token): ${pathname}`)
        return NextResponse.next()
    }

    // Belum login: izinkan public paths
    if (isPublicPath) {
        writeLog(`ALLOW (public path): ${pathname}`)
        return NextResponse.next()
    }

    // Semua protected route → redirect ke /login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    writeLog(`REDIRECT ${pathname} -> /login (no token, protected)`)
    return NextResponse.redirect(url)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
    ],
}
