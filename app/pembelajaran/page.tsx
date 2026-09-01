'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { BookOpen, Search, Layers, ArrowRight, Loader2, Zap } from 'lucide-react'

export default function PublicPembelajaranPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch('/api/pembelajaran')
                const data = await res.json()
                if (res.ok) setCourses(data.data || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [])

    const filtered = courses.filter(c =>
        c.nama.toLowerCase().includes(search.toLowerCase()) ||
        c.kategori?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-white w-full overflow-x-hidden">
            <Navbar />

            <main className="pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto w-full min-w-0">
                <header className="mb-8 sm:mb-10 md:mb-12 space-y-4 sm:space-y-6 w-full min-w-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Core Competence Curriculum</span>
                    </div>
                    <div className="space-y-3 min-w-0">
                        <h1 className="text-[22px] sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            PROGRAM PEMBELAJARAN MANDIRI <span className="text-emerald-600 block sm:inline text-lg sm:text-xl lg:text-2xl">(Kolaboratif Online).</span>
                        </h1>
                        <p className="max-w-2xl text-[13px] sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed sm:border-l-2 sm:border-emerald-100 sm:pl-4">
                            Meracik Kompetensi, Membangun Lamongan MEGILAN.
                        </p>
                    </div>

                    <div className="pt-2 sm:pt-4 w-full max-w-full min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-100 p-2.5 sm:p-3 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-200 transition-all group w-full overflow-hidden">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari kurikulum atau materi kompetensi..."
                                className="flex-1 min-w-0 bg-transparent outline-none font-bold text-sm text-slate-700 placeholder:text-slate-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="text-xs font-black text-emerald-600 hover:text-emerald-700 px-2 shrink-0">HAPUS</button>
                            )}
                        </div>
                    </div>
                </header>

                <section className="w-full min-w-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
                            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600 animate-spin" />
                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Menyusun Kurikulum...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full">
                            {filtered.map((item) => (
                                <div key={item.id} className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full min-w-0">
                                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                                        <Image
                                            src={item.gambar || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={item.nama}
                                            width={800}
                                            height={450}
                                            loading="lazy"
                                        />
                                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/85 backdrop-blur-md rounded-full border border-white/10">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.kategori || 'INTI'}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Zap className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500 shrink-0" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kurikulum Terakreditasi</span>
                                        </div>
                                        <h3 className="text-[15px] sm:text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight line-clamp-2 min-w-0">{item.nama}</h3>
                                        <p className="text-[13px] text-slate-500 font-medium line-clamp-2 leading-relaxed mt-2 min-w-0">{item.deskripsi}</p>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 gap-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                <Layers className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 16 MATERI
                                            </div>
                                            <Link
                                                href={`/pembelajaran/${item.id}`}
                                                className="h-9 w-9 sm:h-10 sm:w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors active:scale-90 shrink-0"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center border-2 border-dashed border-slate-200 w-full">
                            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg sm:text-xl font-black text-slate-700 uppercase tracking-tight">Materi Segera Hadir</h3>
                            <p className="mt-2 text-sm text-slate-500 font-medium">Biro SDM sedang meninjau materi pembelajaran terbaru untuk Anda.</p>
                            <button onClick={() => setSearch('')} className="mt-6 inline-flex px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors">Tampilkan Semua</button>
                        </div>
                    )}
                </section>
            </main>

            <footer className="py-8 sm:py-10 border-t border-slate-100 text-center bg-white w-full overflow-hidden">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4">&copy; 2026 SURAJAYA CORPU E-LEARNING HUB. PENGETAHUAN TANPA BATAS.</p>
            </footer>
        </div>
    )
}
