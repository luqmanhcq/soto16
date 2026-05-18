import { NextRequest, NextResponse } from 'next/server'

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
