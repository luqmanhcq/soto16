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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch('/api/auth/me')
                if (res.ok) {
                    const result = await res.json()
                    // In /api/auth/me, the data property is the user object itself
                    setUser(result.data)
                }
            } catch (error) {
                console.error('Check auth failed', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [])

    const login = async (nip: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nip, password }),
        })

        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.message || 'Login gagal')
        }

        // In /api/auth/login, the data property contains { token, user }
        setUser(result.data.user)

        // Redirect based on role
        router.push('/dashboard')
    }

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setUser(null)
        router.push('/login')
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
