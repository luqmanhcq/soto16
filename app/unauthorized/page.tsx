'use client'

import React from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900">Akses Ditolak</h1>
                    <p className="text-slate-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                </div>
                <p className="text-sm text-slate-500">
                    Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator sistem.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Kembali ke Dashboard
                </Link>
            </div>
        </div>
    )
}
