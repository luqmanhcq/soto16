'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    User,
    Mail,
    Briefcase,
    Building2,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ShieldCheck
} from 'lucide-react'
import FullPageLoader from '@/components/FullPageLoader'

export default function ProfilePage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const [profileData, setProfileData] = useState(() => ({
        nama: user?.nama || '',
        email: user?.email || '',
        jabatan: user?.jabatan || '',
        unit_kerja: user?.unit_kerja || ''
    }))

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccess('')
        setError('')

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            })
            const result = await res.json()
            if (res.ok) {
                setSuccess('Profil berhasil diperbarui!')
                setTimeout(() => setSuccess(''), 3000)
            } else {
                setError(result.message || 'Gagal memperbarui profil')
            }
        } catch {
            setError('Terjadi kesalahan koneksi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {loading && <FullPageLoader message="Update Identitas..." subMessage="Sinkronisasi Server BKD" />}
            
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-xl ring-4 ring-white">
                        {profileData.nama?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{profileData.nama || 'Profil'}</h1>
                        <div className="mt-2 inline-flex items-center gap-2 text-indigo-600 font-bold uppercase text-xs tracking-wider px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {user?.role?.replace('_', ' ')}
                        </div>
                    </div>
                </header>

                {(success || error) && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${
                        success ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                        {success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                        <span>{success || error}</span>
                    </div>
                )}

                <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-600" />
                        Informasi Personal
                    </h2>

                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap & Gelar</label>
                            <div className="flex items-center gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0" />
                                <input
                                    className="flex-1 bg-transparent outline-none font-semibold text-slate-700 text-sm sm:text-base"
                                    value={profileData.nama}
                                    onChange={(e) => setProfileData({ ...profileData, nama: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Institusi</label>
                            <div className="flex items-center gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all">
                                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0" />
                                <input
                                    className="flex-1 bg-transparent outline-none font-semibold text-slate-700 text-sm sm:text-base"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jabatan</label>
                            <div className="flex items-center gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all">
                                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0" />
                                <input
                                    className="flex-1 bg-transparent outline-none font-semibold text-slate-700 text-sm sm:text-base"
                                    value={profileData.jabatan}
                                    onChange={(e) => setProfileData({ ...profileData, jabatan: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit Kerja</label>
                            <div className="flex items-center gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all">
                                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0" />
                                <input
                                    className="flex-1 bg-transparent outline-none font-semibold text-slate-700 text-sm sm:text-base"
                                    value={profileData.unit_kerja}
                                    onChange={(e) => setProfileData({ ...profileData, unit_kerja: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-3.5 sm:py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            SIMPAN PERUBAHAN
                        </button>
                    </form>
                </section>

                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Surajaya Corpu</p>
                </div>
            </div>
        </div>
    )
}
