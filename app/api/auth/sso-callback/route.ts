import { NextRequest, NextResponse } from 'next/server'
import { ssoService } from '@/lib/services/sso.service'

/**
 * SSO Callback Endpoint
 *
 * SiMEGILAN redirects here after successful login:
 *   GET /api/auth/sso-callback?token=xxx
 *
 * Flow:
 * 1. Extract token from query parameter
 * 2. Validate token against sso_tokens table in simegilan DB
 * 3. Consume (mark as used) the one-time token
 * 4. Look up pegawai data by nip_baru
 * 5. Find or create user in sisoto.users table (preserve existing roles)
 * 6. Issue JWT token, set cookie
 * 7. Redirect to /dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const redirectRole = searchParams.get('role')

    if (!token) {
      // No token provided — redirect to login with error
      const url = new URL('/login', request.nextUrl.origin)
      url.searchParams.set('error', 'sso_no_token')
      return NextResponse.redirect(url)
    }

    // Authenticate via SSO (pass redirect role from SiMEGILAN URL)
    const result = await ssoService.authenticateWithSsoToken(token, redirectRole || undefined)

    // Determine if we're on HTTPS (for Secure cookie flag)
    const isProduction = process.env.NODE_ENV === 'production'
    const isSecure =
      isProduction &&
      (request.nextUrl.protocol === 'https:' ||
        request.headers.get('x-forwarded-proto') === 'https')

    // Build redirect URL to /dashboard
    const redirectUrl = new URL('/dashboard', request.nextUrl.origin)

    // Create redirect response with cookie
    const response = NextResponse.redirect(redirectUrl)

    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    // On any error, redirect to login page with error flag
    const url = new URL('/login', request.nextUrl.origin)
    const message = error instanceof Error ? error.message : 'SSO authentication failed'
    url.searchParams.set('error', 'sso_failed')
    url.searchParams.set('msg', message)
    return NextResponse.redirect(url)
  }
}
