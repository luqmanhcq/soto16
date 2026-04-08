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
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Full Page Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                    <div className="relative">
                        <div className="h-20 w-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <ShieldCheck className="h-8 w-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-black tracking-[0.2em] text-xs uppercase italic">Mendaftarkan Akun...</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Kepegawaian Terintegrasi BKD</p>
                    </div>
                </div>
            )}

            <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-0 bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-700">
                
                {/* Left Side: Branding/Visual */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-500">
                                <ShieldCheck className="h-7 w-7 text-indigo-600" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">SI-SOTO.</span>
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <h2 className="text-5xl font-black text-white leading-none tracking-tighter">
                            Mulai Perjalanan <br />
                            <span className="text-indigo-200">Karir Digital</span> <br />
                            Anda Hari Ini.
                        </h2>
                        <p className="text-indigo-100/70 text-lg font-medium max-w-sm leading-relaxed">
                            Pendaftaran khusus untuk Aparatur Sipil Negara di lingkungan pemerintahan daerah.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-wide">Verifikasi Akun</p>
                            <p className="text-indigo-200/60 text-[10px] font-bold uppercase italic">Sesuai Data Kepegawaian Nasional</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Register Form */}
                <div className="p-10 lg:p-14 flex flex-col justify-center bg-white/[0.02] overflow-y-auto max-h-[90vh]">
                    <div className="max-w-md mx-auto w-full space-y-8">
                        <header className="space-y-3">
                            <div className="lg:hidden flex justify-center mb-6">
                                <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight leading-none">Buat Akun Baru</h1>
                            <p className="text-slate-500 font-bold text-sm">Lengkapi data diri Anda secara lengkap.</p>
                        </header>

                        {(error || success) && (
                            <div className={`px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                                {error ? <AlertCircle className="h-5 w-5 flex-shrink-0" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
                                <span className="text-xs font-bold uppercase italic tracking-tight">{error || success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 lg:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nama Lengkap</label>
                                <input
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold text-white text-sm"
                                    placeholder="Sesuai NIK/NIP"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">NIP (18 Digit)</label>
                                <input
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold text-white text-sm"
                                    placeholder="19xxxxxxxxxxxxxx"
                                    value={formData.nip}
                                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Institusi</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold text-white text-sm"
                                    placeholder="email@instansi.go.id"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2 lg:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Kata Sandi</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold text-white text-sm"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Konfirmasi</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold text-white text-sm"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="sm:col-span-2 w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 h-14"
                            >
                                <ArrowRight className="h-5 w-5" />
                                DAFTAR SEKARANG
                            </button>
                        </form>

                        <footer className="text-center pt-8 border-t border-white/5">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">
                                Sudah punya akun? {' '}
                                <Link href="/login" className="text-indigo-500 hover:text-white transition-colors">Masuk Platform</Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    )
}
