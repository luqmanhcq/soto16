'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        nip: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const nip = formData.nip.trim()
        const password = formData.password.trim()

        try {
            await login(nip, password)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Login gagal. Periksa kembali NIP dan password.')
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
                        <p className="text-white font-black tracking-[0.2em] text-xs uppercase italic">Mengautentikasi...</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Sertifikasi Keamanan ISO 27001</p>
                    </div>
                </div>
            )}

            <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-0 bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-700">
                
                {/* Left Side: Branding/Visual */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-black/20" />
                    
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
                            Transformasi <br />
                            <span className="text-indigo-200">Talenta Digital</span> <br />
                            ASN Indonesia.
                        </h2>
                        <p className="text-indigo-100/70 text-lg font-medium max-w-sm leading-relaxed">
                            Akses pelatihan, webinar, dan sertifikasi kompetensi dalam satu platform terintegrasi.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-8 pt-6 border-t border-white/10">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-indigo-600 bg-slate-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest">
                            Bergabung dengan 15.000+ ASN Lainnya
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-10 lg:p-20 flex flex-col justify-center bg-white/[0.02]">
                    <div className="max-w-sm mx-auto w-full space-y-10">
                        <header className="space-y-3">
                            <div className="lg:hidden flex justify-center mb-8">
                                <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight leading-none">Login Akun</h1>
                            <p className="text-slate-500 font-bold text-sm">Gunakan NIP dan password akun SI-SOTO Anda.</p>
                        </header>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="text-xs font-bold uppercase italic tracking-tight">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nomor Induk Pegawai (NIP)</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                        <Mail className="h-5 w-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-slate-800 transition-all font-bold text-white placeholder:text-slate-700"
                                        placeholder="19xxxxxxxxxxxxxxxx"
                                        value={formData.nip}
                                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                        required
                                        maxLength={18}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kata Sandi</label>
                                    <Link href="#" className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-white transition-colors">Lupa Password?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                        <Lock className="h-5 w-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-slate-800 transition-all font-bold text-white placeholder:text-slate-700"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 h-14"
                            >
                                <Zap className="h-5 w-5 fill-white" />
                                MASUK SEKARANG
                            </button>
                        </form>

                        <footer className="text-center pt-8 border-t border-white/5 space-y-6">
                            <p className="text-slate-500 text-xs font-bold">
                                Belum memiliki akun? {' '}
                                <Link href="/register" className="text-indigo-500 hover:text-white transition-colors">Daftar di sini</Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    )
}
