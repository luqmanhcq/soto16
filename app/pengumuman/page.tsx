'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ShieldCheck, Bell, Calendar, ArrowRight, Loader2, Search, ArrowLeft, Info } from 'lucide-react'

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function fetchAnnouncements() {
            try {
                const res = await fetch('/api/pengumuman')
                const data = await res.json()
                if (res.ok) setAnnouncements(data.data || [])
            } catch (err) {
                console.error('Failed to fetch announcements', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAnnouncements()
    }, [])

    const filtered = announcements.filter(a =>
        a.judul.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Simple Public Nav */}
            <Navbar />

            <main className="pt-32 pb-40 max-w-5xl mx-auto px-6">
                <header className="mb-20 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full">
                        <Bell className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pusat Informasi Terintegrasi</span>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic">Pengumuman & <br /><span className="text-indigo-600">Rilis Terbaru.</span></h1>

                    <div className="pt-8">
                        <div className="bg-white p-2 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari berita atau pengumuman..."
                                className="flex-1 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <section className="space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                            <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Menyiapkan Informasi...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        filtered.map((item) => (
                            <div key={item.id} className="group bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-500 flex flex-col md:flex-row gap-10 items-start">
                                <div className="h-20 w-20 min-w-[80px] bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-indigo-100">
                                    <Info className="h-10 w-10" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Calendar className="h-3 w-3 text-indigo-600" />
                                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight italic uppercase leading-none">{item.judul}</h3>
                                    <p className="text-slate-500 font-bold leading-relaxed line-clamp-3">{item.deskripsi}</p>
                                    <div className="pt-4">
                                        <Link href="#" className="inline-flex items-center gap-2 font-black text-indigo-600 uppercase text-[10px] tracking-widest border-b-2 border-indigo-100 hover:border-indigo-600 transition-all pb-1 group-hover:gap-4">
                                            BACA SELENGKAPNYA <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-20 rounded-[3.5rem] text-center space-y-6 border-2 border-dashed border-slate-200">
                            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Bell className="h-10 w-10" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-300 uppercase italic">Belum Ada Pengumuman Terkait</h4>
                            <button onClick={() => setSearch('')} className="text-xs font-black text-indigo-600 border-b border-indigo-200">Reset Pencarian</button>
                        </div>
                    )}
                </section>
            </main>

            <footer className="bg-white py-20 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">&copy; 2026 SI-SOTO TALENT PLATFORM. INFORMASI PUBLIK.</p>
            </footer>
        </div>
    )
}
