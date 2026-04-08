'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { BookOpen, Search, Layers, ArrowRight, Loader2, Filter, Zap, Layout } from 'lucide-react'

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
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-40 px-6 lg:px-24 max-w-7xl mx-auto">
                <header className="mb-20 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Core Competence Curriculum</span>
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
                        Platform <br /><span className="text-emerald-600">Belajar Mandiri.</span>
                    </h1>
                    <p className="max-w-2xl text-slate-400 font-bold text-lg leading-relaxed italic border-l-4 border-emerald-50 pl-10">Kembangkan potensi teknis dan leadership Anda dengan kurikulum terstandarisasi yang bisa dipelajari sesuai ritme pribadi Anda.</p>

                    <div className="pt-10 flex flex-col md:flex-row gap-6">
                        <div className="flex-1 flex items-center gap-4 bg-slate-50 border border-slate-100 p-5 rounded-[2rem] focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50 transition-all shadow-inner group">
                            <Search className="h-6 w-6 text-slate-300 group-focus-within:text-emerald-600" />
                            <input
                                type="text"
                                placeholder="Cari kurikulum atau materi kompetensi..."
                                className="flex-1 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="px-10 py-5 bg-white border border-slate-100 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-100 flex items-center gap-3 hover:bg-slate-900 hover:text-white transition-all">
                            <Filter className="h-4 w-4" /> Struktur Level
                        </button>
                    </div>
                </header>

                <section>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                            <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">Menyusun Kurikulum...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filtered.map((item) => (
                                <div key={item.id} className="group flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-50 hover:shadow-2xl hover:shadow-emerald-100 hover:-translate-y-3 transition-all duration-500 overflow-hidden">
                                    <div className="relative aspect-video overflow-hidden">
                                        <img
                                            src={item.gambar || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            alt={item.nama}
                                        />
                                        <div className="absolute top-6 left-6 px-4 py-2 bg-slate-900/90 backdrop-blur rounded-2xl shadow-xl border border-white/10">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{item.kategori || 'INTI'}</span>
                                        </div>
                                    </div>
                                    <div className="p-10 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight italic">Kurikulum Terakreditasi</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase italic tracking-tighter leading-none mb-4">{item.nama}</h3>
                                        <p className="text-slate-400 font-bold line-clamp-3 mb-8 leading-relaxed italic border-b border-slate-50 pb-6">{item.deskripsi}</p>

                                        <div className="flex items-center justify-between mt-auto pt-4">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-tighter">
                                                <Layers className="h-4 w-4 text-emerald-400" /> 16 MATERI
                                            </div>
                                            <Link
                                                href={`/pembelajaran/${item.id}`}
                                                className="h-14 w-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shadow-lg group-hover:rotate-12"
                                            >
                                                <ArrowRight className="h-6 w-6" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-[4rem] p-40 text-center space-y-8 border-4 border-dashed border-slate-100">
                            <Layout className="h-20 w-20 text-slate-200 mx-auto" />
                            <h3 className="text-4xl font-black text-slate-300 uppercase italic tracking-tighter">Materi Segera Hadir</h3>
                            <p className="text-slate-400 font-bold italic">Biro SDM sedang meninjau materi pembelajaran terbaru untuk Anda.</p>
                            <button onClick={() => setSearch('')} className="text-emerald-600 font-black border-b-2 border-emerald-100 hover:border-emerald-600 transition-all uppercase text-[10px] tracking-widest">Tampilkan Semua</button>
                        </div>
                    )}
                </section>
            </main>

            <footer className="py-20 border-t border-slate-50 text-center bg-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">&copy; 2026 SI-SOTO E-LEARNING HUB. PENGETAHUAN TANPA BATAS.</p>
            </footer>
        </div>
    )
}
