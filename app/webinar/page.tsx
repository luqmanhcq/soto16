'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  Video, Search, Calendar, Users, ArrowRight, Loader2,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type LocalWebinar = {
  id: number
  nama_webinar: string
  deskripsi: string
  kategori: string
  gambar: string
  tanggal_mulai: string
  kuota: number
  status: string
  sumber: 'lokal'
}

// ─── Pagination Config ──────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6

// ─── Component ──────────────────────────────────────────────────────────────

export default function PublicWebinarPage() {
  const [localWebinars, setLocalWebinars] = useState<LocalWebinar[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch local webinars
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/webinar')
        const json = await res.json()
        if (res.ok) {
          setLocalWebinars(
            (json.data || []).map((w: any) => ({ ...w, sumber: 'lokal' }))
          )
        }
      } catch (err) {
        console.error('Failed to load webinars', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter by search
  const filtered = localWebinars.filter(w =>
    w.nama_webinar.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedWebinars = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-28 md:pt-32 pb-20 md:pb-40 px-4 md:px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10 md:mb-16 space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl border border-indigo-100">
            <Video className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic">DRAJAT ASN</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Program Webinar &quot;DRAJAT ASN&quot;<br />
            <span className="text-indigo-600 text-lg md:text-2xl lg:text-3xl">(Digitalisasi Ruang Ajar dan Talenta ASN)</span>
          </h1>
          <p className="max-w-2xl text-slate-400 font-bold text-sm md:text-lg leading-relaxed">
            Belajar tanpa batas, berkarya dengan tuntas, untuk Lamongan Megilan.
          </p>

          {/* Search */}
          <div className="pt-4 md:pt-6">
            <div className="flex items-center gap-3 md:gap-4 bg-slate-50 border border-slate-100 p-3 md:p-5 rounded-xl md:rounded-[2rem] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all shadow-inner group">
              <Search className="h-5 w-5 md:h-6 md:w-6 text-slate-300 group-focus-within:text-indigo-600" />
              <input
                type="text"
                placeholder="Cari webinar berdasarkan judul..."
                className="flex-1 bg-transparent outline-none font-bold text-sm md:text-base text-slate-700 placeholder:text-slate-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-xs md:text-sm font-bold text-slate-400">
              Menampilkan <span className="text-indigo-600">{paginatedWebinars.length}</span> dari <span className="text-indigo-600">{filtered.length}</span> webinar
            </p>
          )}
        </header>

        {/* Results */}
        <section>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-40 gap-4 md:gap-6">
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-indigo-600 animate-spin" />
              <p className="font-black text-slate-300 uppercase tracking-widest text-[10px] md:text-xs italic">
                Memuat Webinar...
              </p>
            </div>
          ) : paginatedWebinars.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {paginatedWebinars.map((item) => (
                  <div
                    key={String(item.id)}
                    className="group flex flex-col bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-50 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={item.gambar || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        alt={item.nama_webinar}
                      />
                      {/* Status badge */}
                      <div className={`absolute top-3 md:top-6 left-3 md:left-6 px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-2xl shadow-xl border text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none ${
                        item.status === 'selesai' || item.status?.includes('Selesai')
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                        {item.status === 'selesai' || item.status?.includes('Selesai') ? 'Selesai' : 'Registrasi Dibuka'}
                      </div>
                      {/* Category badge */}
                      {item.kategori && (
                        <div className="absolute top-3 md:top-6 right-3 md:right-6 px-2 md:px-3 py-1 md:py-1.5 bg-white/90 backdrop-blur rounded-lg md:rounded-xl shadow border border-white/50">
                          <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">
                            {item.kategori}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-8 lg:p-10 flex-1 flex flex-col">
                      {/* Title */}
                      <h3 className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter leading-none mb-3 md:mb-4">
                        {item.nama_webinar}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-400 font-bold text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-4 md:mb-8 leading-relaxed italic">
                        {item.deskripsi}
                      </p>

                      {/* Meta */}
                      <div className="space-y-2 md:space-y-4 mb-6 md:mb-10 pt-3 md:pt-6 border-t border-slate-50">
                        {/* Date */}
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tighter">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 text-indigo-400" />
                          {new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>

                        {/* Kuota */}
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tighter">
                          <Users className="h-3 w-3 md:h-4 md:w-4 text-indigo-400" />
                          {item.kuota || 'UNLIMITED'} PESERTA
                        </div>
                      </div>

                      {/* CTA */}
                      <Link
                        href={`/webinar/${item.id}`}
                        className="mt-auto inline-flex items-center justify-center gap-2 md:gap-4 py-3 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
                      >
                        Daftar Sekarang <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 md:mt-16 flex items-center justify-center gap-2 md:gap-3">
                  {/* Previous */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-xl md:rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1 md:gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                            : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-xl md:rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                  >
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl md:rounded-[4rem] p-12 md:p-40 text-center space-y-4 md:space-y-8 border-4 border-dashed border-slate-100">
              <Video className="h-12 w-12 md:h-20 md:w-20 text-slate-200 mx-auto" />
              <h3 className="text-2xl md:text-4xl font-black text-slate-300 uppercase italic tracking-tighter">
                Katalog Sedang Kosong
              </h3>
              <p className="text-sm md:text-base text-slate-400 font-bold italic">
                Nantikan rilis jadwal webinar terbaru di kanal pengumuman.
              </p>
              <button
                onClick={() => setSearch('')}
                className="text-indigo-600 font-black border-b-2 border-indigo-100 hover:border-indigo-600 transition-all uppercase text-[10px] tracking-widest"
              >
                Tampilkan Semua
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="py-12 md:py-20 border-t border-slate-50 text-center bg-white">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          &copy; 2026 SURAJAYA CORPU. DIGITAL LEARNING HUB.
        </p>
      </footer>
    </div>
  )
}
