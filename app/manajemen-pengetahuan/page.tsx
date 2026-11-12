'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { BookOpen, Search, Loader2, ArrowRight, Clock, Layers } from 'lucide-react'

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

            <main className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header - simpel & compact */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-xs font-bold">
                            <BookOpen className="h-3.5 w-3.5" /> Manajemen Pengetahuan
                        </span>
                        <span className="text-xs text-slate-400 hidden sm:inline">{filteredPrograms.length} program</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Manajemen Pengetahuan
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
                        Dokumentasi, best practice, dan inovasi ASN — ringkas, mudah diakses di HP maupun desktop.
                    </p>
                </div>

                {/* Search - compact */}
                <div className="mb-6 flex gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                        <Search className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari program..."
                            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600 px-2">Hapus</button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                                <div className="h-32 bg-slate-100 rounded-xl mb-3" />
                                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-slate-100 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : filteredPrograms.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPrograms.map((item) => (
                            <Link
                                key={item.id}
                                href={`/manajemen-pengetahuan/${item.slug}`}
                                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all flex flex-col"
                            >
                                {item.gambar ? (
                                    <div className="h-40 overflow-hidden bg-slate-100 relative shrink-0">
                                        <Image
                                            src={item.gambar}
                                            alt={item.nama}
                                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                            width={600}
                                            height={320}
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-24 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center shrink-0">
                                        <BookOpen className="h-8 w-8 text-indigo-300" />
                                    </div>
                                )}
                                <div className="p-4 flex flex-col flex-1 gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-wide">
                                            {item.kategori || 'Umum'}
                                        </span>
                                    </div>
                                    <h3 className="text-[15px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                                        {item.nama}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
                                        {item.deskripsi || 'Materi pembelajaran manajemen pengetahuan.'}
                                    </p>
                                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100">
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                                            <Layers className="h-3.5 w-3.5" /> Lihat materi
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:gap-1.5 transition-all">
                                            Detail <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h4 className="mt-3 text-sm font-bold text-slate-700">Program tidak ditemukan</h4>
                        <p className="mt-1 text-xs text-slate-500">Coba ubah kata kunci pencarian.</p>
                        <button
                            onClick={() => setSearch('')}
                            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors"
                        >
                            Tampilkan Semua
                        </button>
                    </div>
                )}
            </main>

            <footer className="border-t border-slate-200 bg-white py-6 text-center">
                <p className="text-xs text-slate-400 font-medium">
                    © 2026 SURAJAYA CORPU — Knowledge Hub
                </p>
            </footer>
        </div>
    )
}
