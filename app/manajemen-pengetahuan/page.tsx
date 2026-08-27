'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { BookOpen, Clock, Search, GraduationCap, Loader2, ArrowRight } from 'lucide-react'

export default function ManajemenPengetahuanPage() {
    const [programs, setPrograms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const res = await fetch('/api/manajemen-pengetahuan')
                const data = await res.json()
                if (res.ok) setPrograms(data.data || [])
            } catch (err) {
                console.error('Failed to fetch data', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredPrograms = programs.filter(p =>
        p.nama.toLowerCase().includes(search.toLowerCase()) ||
        p.deskripsi?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="pt-32 pb-40 max-w-7xl mx-auto px-6 lg:px-24">
                <header className="mb-20 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-6 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Manajemen Pengetahuan</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
                            Kelola <span className="text-indigo-600">Pengetahuan.</span><br />
                            <span className="text-slate-400">Pusat Dokumentasi ASN.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-bold leading-relaxed italic border-l-4 border-indigo-100 pl-8">
                            Akses dokumentasi, best practice, lesson learned, dan inovasi untuk mendukung pengembangan kompetensi.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Search className="h-6 w-6" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari program pengetahuan..."
                                className="flex-1 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300 text-lg"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <section className="space-y-16">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                            <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">
                                Memuat Program...
                            </p>
                        </div>
                    ) : filteredPrograms.length > 0 ? (
                        <div className="grid lg:grid-cols-2 gap-10">
                            {filteredPrograms.map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 overflow-hidden flex flex-col justify-between"
                                >
                                    <div>
                                        {item.gambar && (
                                            <div className="h-56 overflow-hidden relative">
                                                <Image
                                                    src={item.gambar}
                                                    alt={item.nama}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    width={800}
                                                    height={450}
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-6 left-6 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                                                    MANAJEMEN PENGETAHUAN
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-10 lg:p-14 pb-0 space-y-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border bg-indigo-50 text-indigo-600 border-indigo-100">
                                                    {item.kategori || 'DOKUMENTASI'}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tighter uppercase italic leading-none">
                                                    {item.nama}
                                                </h3>
                                                <p className="text-slate-500 font-bold leading-relaxed line-clamp-3 italic">
                                                    {item.deskripsi}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 lg:p-14 pt-6 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Akses Program
                                            </span>
                                        </div>

                                        <Link
                                            href={`/manajemen-pengetahuan/${item.slug}`}
                                            className="inline-flex items-center justify-center gap-4 py-4 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all group/btn w-full"
                                        >
                                            Lihat Detail <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-40 rounded-[4rem] text-center space-y-8 border-4 border-dashed border-slate-100">
                            <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                                <BookOpen className="h-12 w-12" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-3xl font-black text-slate-300 uppercase italic tracking-tighter leading-none">
                                    Program Tidak Ditemukan
                                </h4>
                                <p className="text-slate-400 font-bold italic">
                                    Belum ada program manajemen pengetahuan yang tersedia
                                </p>
                            </div>
                            <button
                                onClick={() => { setSearch('') }}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all"
                            >
                                Tampilkan Semua
                            </button>
                        </div>
                    )}
                </section>
            </main>

            <footer className="bg-white py-20 border-t border-slate-50 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    &copy; 2026 SURAJAYA CORPU TALENT PLATFORM. DIGITAL KNOWLEDGE HUB.
                </p>
            </footer>
        </div>
    )
}