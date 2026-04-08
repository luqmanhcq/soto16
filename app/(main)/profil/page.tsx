'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    User,
    Mail,
    Briefcase,
    Building2,
    Lock,
    ShieldCheck,
    ArrowRight,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    LogOut,
    Fingerprint,
    Info
} from 'lucide-react'

export default function ProfilePage() {
    const { user, login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const [profileData, setProfileData] = useState({
        nama: '',
        email: '',
        jabatan: '',
        unit_kerja: ''
    })

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        if (user) {
            setProfileData({
                nama: user.nama || '',
                email: user.email || '',
                jabatan: (user as any).jabatan || '',
                unit_kerja: (user as any).unit_kerja || ''
            })
        }
    }, [user])

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
                // Silent update session in AuthContext if needed or refresh
                setTimeout(() => setSuccess(''), 3000)
            } else {
                setError(result.message || 'Gagal memperbarui profil')
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Konfirmasi kata sandi tidak cocok')
            return
        }

        setLoading(true)
        setSuccess('')
        setError('')

        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData)
            })
            const result = await res.json()
            if (res.ok) {
                setSuccess('Kata sandi berhasil diubah!')
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                setTimeout(() => setSuccess(''), 3000)
            } else {
                setError(result.message || 'Gagal mengubah kata sandi')
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12">
            <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
                <div className="flex items-center gap-8">
                    <div className="h-28 w-28 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-100 ring-4 ring-white">
                        {profileData.nama?.[0]}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profileData.nama}</h1>
                        <p className="flex items-center gap-2 text-indigo-600 font-black uppercase text-xs tracking-widest mt-2 px-3 py-1 bg-indigo-50 rounded-lg w-fit border border-indigo-100 italic">
                            <ShieldCheck className="h-3 w-3" />
                            Diverifikasi Sebagai {user?.role?.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                {success && (
                    <div className="flex items-center gap-3 bg-green-50 text-green-700 px-6 py-4 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl shadow-green-100/50">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-bold text-sm uppercase tracking-tighter">{success}</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 bg-red-50 text-red-700 px-6 py-4 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl shadow-red-100/50">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-bold text-sm uppercase tracking-tighter">{error}</span>
                    </div>
                )}
            </header>

            <div className="grid gap-12 lg:grid-cols-2">
                {/* Profile Information Card */}
                <section className="bg-white p-10 lg:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">
                        <Info className="h-6 w-6 text-indigo-600" />
                        Informasi Personal
                    </h2>

                    <form onSubmit={handleProfileSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 leading-none">Nama Lengkap & Gelar</label>
                            <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all group">
                                <User className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500" />
                                <input
                                    className="flex-1 bg-transparent outline-none font-bold text-slate-700"
                                    value={profileData.nama}
                                    onChange={(e) => setProfileData({ ...profileData, nama: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 leading-none">Email Institusi</label>
                            <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all group">
                                <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500" />
                                <input
                                    className="flex-1 bg-transparent outline-none font-bold text-slate-700"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 leading-none">Jabatan</label>
                                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all group">
                                    <Briefcase className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500" />
                                    <input
                                        className="flex-1 bg-transparent outline-none font-bold text-slate-700 text-sm"
                                        value={profileData.jabatan}
                                        onChange={(e) => setProfileData({ ...profileData, jabatan: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 leading-none">Unit Kerja</label>
                                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all group">
                                    <Building2 className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500" />
                                    <input
                                        className="flex-1 bg-transparent outline-none font-bold text-slate-700 text-sm"
                                        value={profileData.unit_kerja}
                                        onChange={(e) => setProfileData({ ...profileData, unit_kerja: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 leading-none"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                            SIMPAN PERUBAHAN
                        </button>
                    </form>
                </section>

                {/* Security & Access Card */}
                <section className="bg-slate-900 p-10 lg:p-14 rounded-[3.5rem] shadow-2xl shadow-indigo-100/10 text-white">
                    <h2 className="text-2xl font-black mb-10 flex items-center gap-3">
                        <Fingerprint className="h-6 w-6 text-indigo-400" />
                        Keamanan Akun
                    </h2>

                    <form onSubmit={handlePasswordSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-4 leading-none">Kata Sandi Saat Ini</label>
                            <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:bg-white/10 transition-all group">
                                <Lock className="h-5 w-5 text-indigo-300/20 group-focus-within:text-indigo-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="flex-1 bg-transparent outline-none font-black text-white placeholder:text-white/10"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-4 leading-none">Kata Sandi Baru</label>
                                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:bg-white/10 transition-all group">
                                    <Lock className="h-5 w-5 text-indigo-300/20 group-focus-within:text-indigo-400" />
                                    <input
                                        type="password"
                                        placeholder="Minimal 8 karakter"
                                        className="flex-1 bg-transparent outline-none font-black text-white placeholder:text-white/10"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-4 leading-none">Konfirmasi Kata Sandi Baru</label>
                                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:bg-white/10 transition-all group">
                                    <Lock className="h-5 w-5 text-indigo-300/20 group-focus-within:text-indigo-400" />
                                    <input
                                        type="password"
                                        placeholder="Ulangi kata sandi baru"
                                        className="flex-1 bg-transparent outline-none font-black text-white placeholder:text-white/10"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-5 bg-white text-indigo-900 rounded-2xl font-black text-lg shadow-xl shadow-black/20 hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 leading-none"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                            PERBARUI KEAMANAN
                        </button>
                    </form>

                    <div className="mt-12 pt-12 border-t border-white/5 flex flex-col items-center gap-4">
                        <p className="text-sm font-bold text-white/20 italic text-center">Demi keamanan, disarankan mengubah kata sandi secara berkala setiap 3 bulan.</p>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">SI-SOTO Identity Service v1.0</p>
                    </div>
                </section>
            </div>
        </div>
    )
}
