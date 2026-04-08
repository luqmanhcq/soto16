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
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full -ml-32 -mb-32 animate-double-pulse" />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 lg:p-14 rounded-[3.5rem] shadow-3xl space-y-10">
                    <header className="text-center space-y-4">
                        <Link href="/" className="inline-flex h-16 w-16 items-center justify-center bg-indigo-600 rounded-[1.5rem] text-white shadow-2xl shadow-indigo-500/30 mb-2 hover:scale-110 hover:rotate-12 transition-transform duration-500">
                            <ShieldCheck className="h-10 w-10" />
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none">SELAMAT DATANG <br /><span className="text-indigo-400">SI-SOTO.</span></h1>
                        <p className="text-indigo-300/40 font-bold uppercase text-[10px] tracking-[0.4em] italic leading-none px-12">Pusat Inkubasi Talenta ASN Digital Modern</p>
                    </header>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-tight">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-4 leading-none text-left block">NIP</label>
                            <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all group">
                                <Mail className="h-5 w-5 text-indigo-300/20 group-focus-within:text-indigo-400" />
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent outline-none font-bold text-white placeholder:text-white/10"
                                    placeholder="198701012020121001"
                                    value={formData.nip}
                                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                    required
                                    maxLength={18}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-4">
                                <label className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest leading-none text-left block">Kata Sandi</label>
                                <Link href="#" className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">Lupa Password?</Link>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all group">
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-6 leading-none group"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-5 w-5 fill-white group-hover:scale-125 transition-transform" />}
                            MASUK KE PLATFORM
                        </button>
                    </form>

                    <footer className="text-center pt-10 border-t border-white/5 space-y-6">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Belum memiliki akun ASN?</span>
                            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white text-indigo-400 hover:text-indigo-900 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest border border-white/10">
                                Buat Akun Sekarang <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <p className="text-[10px] font-black text-white/5 uppercase tracking-[0.2em] leading-none">Security Standard ISO 27001 Certified</p>
                    </footer>
                </div>
            </div>
        </div>
    )
}
