'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Video, Search, Calendar, Users, ArrowRight, Loader2, Filter, Layers } from 'lucide-react'

export default function PublicWebinarPage() {
    const [webinars, setWebinars] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function fetchWebinars() {
            try {
                const res = await fetch('/api/webinar')
                const data = await res.json()
                if (res.ok) setWebinars(data.data || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchWebinars()
    }, [])

    const filtered = webinars.filter(w =>
        w.nama_webinar.toLowerCase().includes(search.toLowerCase()) ||
        w.kategori?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-40 px-6 lg:px-24 max-w-7xl mx-auto">
                <header className="mb-20 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                        <Video className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Live Knowledge Transfer</span>
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
                        Eksplorasi <br /><span className="text-indigo-600">Webinar Kompetensi.</span>
                    </h1>
                    <p className="max-w-2xl text-slate-400 font-bold text-lg leading-relaxed">Bergabunglah dengan ribuan ASN lainnya dalam sesi peningkatan skill digital yang dipandu oleh praktisi ahli dari berbagai sektor.</p>

                    <div className="pt-10 flex flex-col md:flex-row gap-6">
                        <div className="flex-1 flex items-center gap-4 bg-slate-50 border border-slate-100 p-5 rounded-[2rem] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all shadow-inner group">
                            <Search className="h-6 w-6 text-slate-300 group-focus-within:text-indigo-600" />
                            <input
                                type="text"
                                placeholder="Cari webinar berdasarkan judul atau topik..."
                                className="flex-1 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="px-10 py-5 bg-white border border-slate-100 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-100 flex items-center gap-3 hover:bg-slate-900 hover:text-white transition-all">
                            <Filter className="h-4 w-4" /> Filter Kategori
                        </button>
                    </div>
                </header>

                <section>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                            <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">Sinkronisasi Katalog...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filtered.map((item) => (
                                <div key={item.id} className="group flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-50 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-3 transition-all duration-500 overflow-hidden">
                                    <div className="relative aspect-video overflow-hidden">
                                        <img
                                            src={item.gambar || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            alt={item.nama_webinar}
                                        />
                                        <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 space-y-1">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">{item.kategori || 'GENERAL'}</span>
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">{(item.jenis_webinar || 'external').toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="p-10 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight italic">Registrasi Dibuka</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter leading-none mb-4">{item.nama_webinar}</h3>
                                        <p className="text-slate-400 font-bold line-clamp-3 mb-8 leading-relaxed italic">{item.deskripsi}</p>

                                        <div className="space-y-4 mb-10 pt-6 border-t border-slate-50 translate-y-2">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-tighter">
                                                <Calendar className="h-4 w-4 text-indigo-400" /> {new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-tighter">
                                                <Users className="h-4 w-4 text-indigo-400" /> {item.kuota || 'UNLIMITED'} PESERTA
                                            </div>
                                        </div>

                                        <Link
                                            href={`/webinar/${item.id}`}
                                            className="mt-auto inline-flex items-center justify-center gap-4 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-slate-200"
                                        >
                                            Daftar Sekarang <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-[4rem] p-40 text-center space-y-8 border-4 border-dashed border-slate-100">
                            <Video className="h-20 w-20 text-slate-200 mx-auto" />
                            <h3 className="text-4xl font-black text-slate-300 uppercase italic tracking-tighter">Katalog Sedang Kosong</h3>
                            <p className="text-slate-400 font-bold italic">Nantikan rilis jadwal webinar terbaru di kanal pengumuman.</p>
                            <button onClick={() => setSearch('')} className="text-indigo-600 font-black border-b-2 border-indigo-100 hover:border-indigo-600 transition-all uppercase text-[10px] tracking-widest">Tampilkan Semua</button>
                        </div>
                    )}
                </section>
            </main>

            <footer className="py-20 border-t border-slate-50 text-center bg-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">&copy; 2026 SI-SOTO TALENT POOL. DIGITAL LEARNING HUB.</p>
            </footer>
        </div>
    )
}
