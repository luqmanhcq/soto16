import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Redirect legacy /home to root /
    if (pathname === '/home') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // Define public paths that DON'T require auth
    const publicPaths = ['/', '/login', '/register', '/tentang', '/pengumuman', '/webinar', '/pembelajaran']
    const isPublicPath = publicPaths.includes(pathname) || 
        pathname.startsWith('/api/auth') || 
        pathname.startsWith('/api/webinar') ||
        pathname.startsWith('/api/pembelajaran') ||
        pathname.startsWith('/api/pengumuman') ||
        pathname.startsWith('/uploads')

    if (token) {
        // Sudah login, jangan akses /login lagi
        if (pathname === '/login') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
        return NextResponse.next()
    }

    // Belum login: public paths boleh
    if (isPublicPath) return NextResponse.next()

    // Semua protected route → redirect ke /login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
    ],
}
