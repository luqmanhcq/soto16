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

    if (token) {
        // Redirect from login to dashboard
        if (pathname === '/login') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    // If NOT authenticated
    if (!token) {
        // Public paths are OK
        if (isPublicPath) return NextResponse.next()

        // Everything else redirects to login
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
    ],
}
