'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, User, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        nama: '',
        nip: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (formData.password !== formData.confirmPassword) {
            setError('Konfirmasi kata sandi tidak cocok')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const result = await res.json()
            if (res.ok) {
                setSuccess('Registrasi berhasil! Silakan login.')
                setTimeout(() => router.push('/login'), 2000)
            } else {
                setError(result.message || 'Registrasi gagal')
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/10 blur-[120px] rounded-full -ml-20 -mb-20" />

            <div className="max-w-xl w-full relative z-10">
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 lg:p-14 rounded-[3.5rem] shadow-2xl space-y-10">
                    <header className="text-center space-y-4">
                        <div className="inline-flex h-16 w-16 items-center justify-center bg-indigo-500 rounded-[1.5rem] text-white shadow-xl shadow-indigo-500/20 mb-4">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Bergabung SI-SOTO</h1>
                        <p className="text-indigo-200/50 font-bold uppercase text-[10px] tracking-[0.3em] italic leading-none">Pusat Pengembangan Kompetensi digital ASN</p>
                    </header>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-tight">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-tight">{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-4 leading-none text-left block">Nama Lengkap</label>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all group">
                                    <User className="h-5 w-5 text-indigo-300/20 group-focus-within:text-indigo-400" />
                                    <input
                                        className="flex-1 bg-transparent outline-none font-bold text-white placeholder:text-white/10"
                                        placeholder="Ahmad ASN"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-4 leading-none text-left block">NIP (18 Digit)</label>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all group">
                                    <ShieldCheck className="h-5 w-5 text-indigo-300/20 group-focus-within:text-indigo-400" />
                                    <input
                                        className="flex-1 bg-transparent outline-none font-bold text-white placeholder:text-white/10"
                                        placeholder="19xxxxxxxxxxxxxx"
                                        value={formData.nip}
                                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-4 leading-none text-left block">Email Institusi</label>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all group">
                                <Mail className="h-5 w-5 text-indigo-300/20 group-focus-within:text-indigo-400" />
                                <input
                                    type="email"
                                    className="flex-1 bg-transparent outline-none font-bold text-white placeholder:text-white/10"
                                    placeholder="email@instansi.go.id"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-4 leading-none text-left block">Kata Sandi</label>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all group">
                                    <Lock className="h-5 w-5 text-indigo-300/20 group-focus-within:text-indigo-400" />
                                    <input
                                        type="password"
                                        className="flex-1 bg-transparent outline-none font-bold text-white placeholder:text-white/10"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-4 leading-none text-left block">Ulangi Sandi</label>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all group">
                                    <Lock className="h-5 w-5 text-indigo-300/20 group-focus-within:text-indigo-400" />
                                    <input
                                        type="password"
                                        className="flex-1 bg-transparent outline-none font-bold text-white placeholder:text-white/10"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-6 leading-none"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
                            DAFTAR SEKARANG
                        </button>
                    </form>

                    <footer className="text-center pt-8 border-t border-white/5">
                        <p className="text-indigo-300/40 font-bold text-sm tracking-tight">Terbatas untuk ASN & Pegawai Pemerintah terintegrasi</p>
                        <p className="mt-4 text-white text-xs font-bold uppercase tracking-widest">Sudah punya akun? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 border-b border-indigo-400/30">Masuk Platform</Link></p>
                    </footer>
                </div>
            </div>
        </div>
    )
}
