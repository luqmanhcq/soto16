'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: 'asn' | 'admin' | 'super_admin'
}

/**
 * ProtectedRoute Component
 * 
 * Menjamin bahwa halaman hanya dirender jika user:
 * 1. Sudah login (user !== null)
 * 2. Memiliki role yang sesuai (jika requiredRole diberikan)
 * 
 * Fitur:
 * - Menampilkan loading spinner saat auth check berlangsung
 * - Auto-redirect ke login jika belum autentikasi
 * - Menunjukkan error page jika role tidak sesuai
 * 
 * @param children - Content yang akan ditampilkan jika user authenticated
 * @param requiredRole - Role yang diperlukan (opsional)
 * 
 * @example
 * // Protect halaman untuk user yang sudah login
 * <ProtectedRoute>
 *   <YourPageContent />
 * </ProtectedRoute>
 * 
 * @example
 * // Protect halaman untuk admin only
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPageContent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Jika masih loading, tunggu
        if (isLoading) return

        // Jika tidak ada user dan loading selesai, redirect ke login
        if (!user) {
            router.replace('/login')
            return
        }

        // Jika ada requiredRole, periksa apakah user memiliki role tersebut
        if (requiredRole && user.role !== requiredRole) {
            // Redirect ke halaman tidak authorized
            router.replace('/unauthorized')
            return
        }
    }, [user, isLoading, requiredRole, router])

    // Tampilkan loading spinner saat auth check berlangsung
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-slate-600 font-medium">Memverifikasi akses...</p>
                </div>
            </div>
        )
    }

    // Jika tidak ada user (redirect sudah dijalankan di useEffect)
    if (!user) {
        return null
    }

    // Jika ada requiredRole dan tidak cocok
    if (requiredRole && user.role !== requiredRole) {
        return null
    }

    // Render children jika semua check pass
    return <>{children}</>
}

export default ProtectedRoute
