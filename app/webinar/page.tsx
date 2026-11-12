'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import {
  Video, Search, Calendar, Users, ArrowRight, Loader2,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

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

const ITEMS_PER_PAGE = 6

export default function PublicWebinarPage() {
  const [localWebinars, setLocalWebinars] = useState<LocalWebinar[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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

  const filtered = localWebinars.filter(w =>
    w.nama_webinar.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedWebinars = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      <Navbar />

      <main className="pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto w-full min-w-0">
        <header className="mb-8 sm:mb-10 md:mb-12 space-y-4 sm:space-y-6 w-full min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
            <Video className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">DRAJAT ASN</span>
          </div>
          <div className="space-y-3 min-w-0">
            <h1 className="text-[22px] sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Program Webinar <span className="text-indigo-600">“DRAJAT ASN”</span>
              <span className="block text-[13px] sm:text-lg lg:text-xl font-bold text-slate-500 normal-case tracking-normal mt-1">Digitalisasi Ruang Ajar dan Talenta ASN</span>
            </h1>
            <p className="max-w-2xl text-[13px] sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed">
              Belajar tanpa batas, berkarya dengan tuntas, untuk Lamongan Megilan.
            </p>
          </div>

          <div className="pt-2 sm:pt-4 w-full max-w-full min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-100 p-2.5 sm:p-3 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-200 transition-all group w-full overflow-hidden">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 shrink-0" />
              <input
                type="text"
                placeholder="Cari webinar berdasarkan judul..."
                className="flex-1 min-w-0 bg-transparent outline-none font-bold text-sm text-slate-700 placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs font-black text-indigo-600 hover:text-indigo-700 px-2 shrink-0">HAPUS</button>
              )}
            </div>
          </div>

          {!loading && (
            <p className="text-xs font-semibold text-slate-500">
              Menampilkan <span className="text-indigo-600 font-black">{paginatedWebinars.length}</span> dari <span className="text-slate-900 font-black">{filtered.length}</span> webinar
            </p>
          )}
        </header>

        <section className="w-full min-w-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 animate-spin" />
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
                Memuat Webinar...
              </p>
            </div>
          ) : paginatedWebinars.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full">
                {paginatedWebinars.map((item) => (
                  <div
                    key={String(item.id)}
                    className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full min-w-0"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <Image
                        src={item.gambar || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={item.nama_webinar}
                        width={800}
                        height={450}
                        loading="lazy"
                      />
                      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full shadow-md border text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${
                        item.status === 'selesai' || item.status?.includes('Selesai')
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-white/95 text-indigo-600 border-white'
                      }`}>
                        {item.status === 'selesai' || item.status?.includes('Selesai') ? 'Selesai' : 'Registrasi Dibuka'}
                      </div>
                      {item.kategori && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/20">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">
                            {item.kategori}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0">
                      <h3 className="text-[15px] sm:text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2 min-w-0">
                        {item.nama_webinar}
                      </h3>
                      <p className="text-[13px] text-slate-500 font-medium line-clamp-2 leading-relaxed mt-2 min-w-0">
                        {item.deskripsi?.trim() ? item.deskripsi : 'Belum ada deskripsi kegiatan.'}
                      </p>

                      <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Users className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          {item.kuota || 'UNLIMITED'} PESERTA
                        </div>
                      </div>

                      <Link
                        href={`/webinar/${item.id}`}
                        className="mt-4 inline-flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors active:scale-[0.98] w-full"
                      >
                        Detail <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 sm:mt-10 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Halaman sebelumnya"
                    className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Halaman berikutnya"
                    className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center border-2 border-dashed border-slate-200 w-full">
              <Video className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto" />
              <h3 className="mt-4 text-lg sm:text-xl font-black text-slate-700 uppercase tracking-tight">
                Katalog Kosong
              </h3>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Nantikan rilis jadwal webinar terbaru.
              </p>
              <button
                onClick={() => setSearch('')}
                className="mt-6 inline-flex px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors"
              >
                Tampilkan Semua
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="py-8 sm:py-10 border-t border-slate-100 text-center bg-white w-full overflow-hidden">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4">
          &copy; 2026 SURAJAYA CORPU. DIGITAL LEARNING HUB.
        </p>
      </footer>
    </div>
  )
}
