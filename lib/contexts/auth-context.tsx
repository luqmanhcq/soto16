'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    nip: string
    nama: string
    email: string
    role: 'asn' | 'admin' | 'super_admin'
    jabatan?: string | null
    unit_kerja?: string | null
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (nip: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Safely parse JSON from a Response.
 * Returns null jika response bukan JSON (misal: HTML 502 Bad Gateway dari reverse proxy).
 */
async function safeParseJson(res: Response): Promise<any> {
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
        return null
    }
    try {
        return await res.json()
    } catch {
        return null
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch('/api/auth/me')
                if (res.ok) {
                    const result = await safeParseJson(res)
                    if (result?.data) {
                        setUser(result.data)
                    }
                }
            } catch (error) {
                console.error('Check auth failed:', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [])

    const login = async (nip: string, password: string): Promise<void> => {
        let res: Response

        try {
            res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nip, password }),
            })
        } catch (networkError) {
            // Tidak bisa reach server sama sekali (network down, CORS block, dll.)
            throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
        }

<<<<<<< HEAD
        // Tangani kasus response bukan JSON (mis. 502 Bad Gateway HTML dari Nginx)
        if (!res.headers.get('content-type')?.includes('application/json')) {
            throw new Error(
                `Server mengembalikan error ${res.status}. ` +
                (res.status === 502 ? 'Bad Gateway — server sedang tidak aktif.' :
                    res.status === 503 ? 'Server sedang tidak tersedia.' :
                        'Terjadi kesalahan pada server.')
            )
        }

        const result = await safeParseJson(res)

        if (!res.ok) {
            throw new Error(result?.message || `Login gagal (HTTP ${res.status})`)
        }

        if (!result?.data?.user) {
            throw new Error('Respons server tidak valid. Hubungi administrator.')
        }

        setUser(result.data.user)
        // Cookie sudah otomatis di-set browser dari header Set-Cookie.
        // Redirect ke /dashboard ditangani oleh login/page.tsx
=======
        // Set user state dari response
        setUser(result.data.user)
        // Cookie sudah otomatis di-set oleh browser dari Set-Cookie header.
        // Redirect ditangani oleh login/page.tsx
>>>>>>> f0e7dfb9cbb1b7976eb3040a70d795bd4663e6fb
    }

    const logout = async (): Promise<void> => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch {
            // Tetap logout dari sisi client meskipun request gagal
        } finally {
            setUser(null)
            router.push('/login')
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
