'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ShieldCheck, Bell, Calendar, ArrowRight, Loader2, Search, ArrowLeft, Info, Video, GraduationCap, Zap, Newspaper } from 'lucide-react'

const CATEGORIES = [
    { name: 'SEMUA', icon: Bell },
    { name: 'WEBINAR EKSTERNAL', icon: Video, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { name: 'PEMBELAJARAN ONLINE EKSTERNAL', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { name: 'PENAWARAN PENGEMBANGAN KOMPETENSI', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { name: 'PENGUMUMAN/INFORMASI LAINNYA', icon: Newspaper, color: 'bg-slate-50 text-slate-600 border-slate-100' },
]

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('SEMUA')

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

    const filtered = announcements.filter(a => {
        const matchesSearch = a.judul.toLowerCase().includes(search.toLowerCase())
        const matchesTab = activeTab === 'SEMUA' || a.kategori === activeTab
        return matchesSearch && matchesTab
    })

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="pt-32 pb-40 max-w-7xl mx-auto px-6 lg:px-24">
                <header className="mb-20 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-6 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                            <Bell className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Broadcast & Informasi Terintegrasi</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
                            Update <span className="text-indigo-600">Terbaru.</span><br />
                            <span className="text-slate-400">Pusat Informasi ASN.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-bold leading-relaxed italic border-l-4 border-indigo-100 pl-8">
                            Temukan penawaran pengembangan kompetensi, webinar eksternal, dan informasi penting lainnya untuk mendukung karir Anda.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Search className="h-6 w-6" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari berita atau pengumuman..."
                                className="flex-1 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300 text-lg"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setActiveTab(cat.name)}
                                    className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 ${
                                        activeTab === cat.name
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                                            : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                                    }`}
                                >
                                    <cat.icon className="h-4 w-4" />
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <section className="grid gap-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                            <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">Sinkronisasi Informasi...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid lg:grid-cols-2 gap-10">
                            {filtered.map((item) => {
                                const catInfo = CATEGORIES.find(c => c.name === item.kategori) || CATEGORIES[4]
                                return (
                                    <div key={item.id} className="group bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 overflow-hidden flex flex-col">
                                        <div className="p-10 lg:p-14 space-y-8 flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${catInfo.color}`}>
                                                    {item.kategori || 'INFORMASI UMUM'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase italic">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tighter uppercase italic leading-none">{item.judul}</h3>
                                                <p className="text-slate-500 font-bold leading-relaxed line-clamp-3 italic">{item.deskripsi}</p>
                                            </div>

                                            <div className="pt-6 flex flex-wrap gap-4 items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                        <catInfo.icon className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akses Informasi</span>
                                                </div>
                                                
                                                <Link 
                                                    href={`/pengumuman/${item.slug}`} 
                                                    className="inline-flex items-center gap-4 py-4 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all group/btn"
                                                >
                                                    Lihat Detail <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-white p-40 rounded-[4rem] text-center space-y-8 border-4 border-dashed border-slate-100">
                            <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                                <Newspaper className="h-12 w-12" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-3xl font-black text-slate-300 uppercase italic tracking-tighter leading-none">Informasi Tidak Ditemukan</h4>
                                <p className="text-slate-400 font-bold italic">Belum ada pengumuman rilis untuk kategori "{activeTab}"</p>
                            </div>
                            <button onClick={() => { setSearch(''); setActiveTab('SEMUA') }} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Tampilkan Semua</button>
                        </div>
                    )}
                </section>
            </main>

            <footer className="bg-white py-20 border-t border-slate-50 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">&copy; 2026 SI-SOTO TALENT PLATFORM. DIGITAL ANNOUNCEMENT HUB.</p>
            </footer>
        </div>
    )
}
