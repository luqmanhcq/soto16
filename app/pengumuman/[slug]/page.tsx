'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Calendar, Clock, FileText, ExternalLink, Loader2, AlertCircle, Newspaper, Zap, GraduationCap } from 'lucide-react'

const CATEGORIES = [
  { name: 'PEMBELAJARAN ONLINE EKSTERNAL', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { name: 'PENAWARAN PENGEMBANGAN KOMPETENSI', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'PENGUMUMAN/INFORMASI LAINNYA', icon: Newspaper, color: 'bg-slate-50 text-slate-600 border-slate-100' },
]

export default function PengumumanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [pengumuman, setPengumuman] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/pengumuman/slug/${slug}`)
                if (!res.ok) {
                    throw new Error('Pengumuman tidak ditemukan')
                }
                const result = await res.json()
                setPengumuman(result.data)
            } catch (err) {
                console.error('Failed to fetch pengumuman:', err)
                setError(err instanceof Error ? err.message : 'Gagal memuat detail pengumuman')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <main className="pt-32 pb-40 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
                        <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">
                            Memuat Detail Pengumuman...
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    if (error || !pengumuman) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <main className="pt-32 pb-40 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                    <div className="bg-white p-12 lg:p-16 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center space-y-6">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
                            Pengumuman Tidak Ditemukan
                        </h1>
                        <p className="text-slate-500 font-bold leading-relaxed italic">
                            {error || 'Pengumuman yang Anda cari tidak tersedia.'}
                        </p>
                        <Link
                            href="/pengumuman"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Kembali ke Pengumuman
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    const catInfo = CATEGORIES.find(c => c.name === pengumuman.kategori) || CATEGORIES[2]
    const isExternal = pengumuman.gambar?.startsWith('http')

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="pt-32 pb-40 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <Link
                    href="/pengumuman"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Kembali ke Daftar Pengumuman
                </Link>

                <article className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {pengumuman.gambar && (
                        <div className="h-72 lg:h-96 xl:h-[400px] overflow-hidden relative">
                            <Image
                                src={pengumuman.gambar}
                                alt={pengumuman.judul}
                                className="w-full h-full object-cover"
                                width={1600}
                                height={800}
                                unoptimized={isExternal}
                                priority
                            />
                            <div className="absolute top-6 left-6">
                                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${catInfo.color}`}>
                                    {pengumuman.kategori || 'INFORMASI UMUM'}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 sm:p-10 lg:p-14 xl:p-16 space-y-10">
                        <header className="space-y-6 max-w-4xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <catInfo.icon className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">
                                    {pengumuman.kategori || 'INFORMASI UMUM'}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-[1.1]">
                                {pengumuman.judul}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-slate-500">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    <span className="font-bold text-slate-700">
                                        {new Date(pengumuman.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </header>

                        <section className="space-y-6 border-t border-slate-100 pt-10 max-w-4xl">
                            <h2 className="text-2xl font-black text-slate-900 border-l-4 border-indigo-600 pl-4 uppercase italic tracking-tight">
                                Isi Pengumuman
                            </h2>
                            <div className="text-slate-700 font-medium leading-relaxed text-lg sm:text-xl whitespace-pre-wrap">
                                {pengumuman.deskripsi}
                            </div>
                        </section>

                        {pengumuman.link_file && (
                            <section className="space-y-6 border-t border-slate-100 pt-10 max-w-4xl">
                                <h2 className="text-2xl font-black text-slate-900 border-l-4 border-indigo-600 pl-4 uppercase italic tracking-tight">
                                    Lampiran
                                </h2>
                                <a
                                    href={pengumuman.link_file}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-4 py-5 px-10 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 w-full sm:max-w-md"
                                >
                                    <FileText className="h-5 w-5" />
                                    Unduh / Buka Lampiran
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </section>
                        )}
                    </div>
                </article>

                <footer className="mt-20 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        &copy; 2026 SURAJAYA CORPU TALENT PLATFORM. DIGITAL ANNOUNCEMENT HUB.
                    </p>
                </footer>
            </main>
        </div>
    )
}