import { NextRequest, NextResponse } from 'next/server'
import { ssoService } from '@/lib/services/sso.service'

/**
 * GET /api/auth/logout
 * Clears the Surajaya Corpu JWT cookie and redirects to SiMEGILAN logout.
 * This performs a full SSO logout (clears both sessions).
 */
export async function GET(request: NextRequest) {
    const isProduction = process.env.NODE_ENV === 'production'
    const isSecure = isProduction && (request.headers.get('x-forwarded-proto') === 'https')

    const ssoLogoutUrl = ssoService.getSsoLogoutUrl()
    const response = NextResponse.redirect(ssoLogoutUrl)

    response.cookies.set('token', '', {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? 'none' : 'lax',
        expires: new Date(0),
        path: '/',
    })

    return response
}

/**
 * POST /api/auth/logout
 * Clears the Surajaya Corpu JWT cookie only (used by frontend SPA logout).
 * After calling this, the frontend should also redirect to SiMEGILAN logout
 * for a complete SSO logout.
 */
export async function POST(request: NextRequest) {
    const response = NextResponse.json(
        { success: true, message: 'Logout berhasil' },
        { status: 200 }
    )

    const isProduction = process.env.NODE_ENV === 'production'
    // Deteksi HTTPS dari header reverse proxy
    const isSecure = isProduction && (request.headers.get('x-forwarded-proto') === 'https')

    // Clear the token cookie — opsi harus identik dengan saat set cookie agar berhasil dihapus
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? 'none' : 'lax',
        expires: new Date(0),
        path: '/',
    })

    return response
}
