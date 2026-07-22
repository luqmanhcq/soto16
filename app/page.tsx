'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import Navbar from '@/components/Navbar'
import {
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  PlayCircle,
  Star,
  ArrowUpRight
} from 'lucide-react'

// --- FALLBACK DATA (IN CASE API IS EMPTY) ---
const FALLBACK_SLIDES = [
  {
    id: 1,
    title: "Surajaya Corpu",
    subtitle: "Kawah candradimuka pengembangan kompetensi ASN untuk Lamongan Megilan.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
    link: "/login",
    cta_text: "Mulai Sekarang"
  }
]

export default function LandingPage() {
  const { user } = useAuth()
  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'webinar' | 'pembelajaran'>('webinar')

  const [featuredWebinars, setFeaturedWebinars] = useState<any[]>([])
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Carousel Logic
  useEffect(() => {
    const slidesCount = heroSlides.length > 0 ? heroSlides.length : FALLBACK_SLIDES.length
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesCount)
    }, 6000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  // Fetch Featured Content
  useEffect(() => {
    async function fetchData() {
      try {
        const [wRes, pRes, cRes] = await Promise.all([
          fetch('/api/webinar?limit=3'),
          fetch('/api/pembelajaran?limit=3'),
          fetch('/api/carousel?active=true')
        ])
        if (wRes.ok) {
          const wData = await wRes.json()
          setFeaturedWebinars(wData.data.slice(0, 3) || [])
        }
        if (pRes.ok) {
          const pData = await pRes.json()
          setFeaturedCourses(pData.data.slice(0, 3) || [])
        }
        if (cRes.ok) {
          const cData = await cRes.json()
          if (cData.data && cData.data.length > 0) {
            setHeroSlides(cData.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch landing page data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const activeSlides = heroSlides.length > 0 ? heroSlides : FALLBACK_SLIDES
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Carousel */}
      <header className="relative h-[70vh] md:h-[85vh] overflow-hidden group">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent z-10" />
            <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 md:px-6 lg:px-24">
              <div className="max-w-3xl space-y-4 md:space-y-8">
                <div className="inline-flex items-center gap-2 px-2 md:px-3 py-1 bg-amber-500 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-lg">
                  PROGRAM UNGGULAN PEMKAB LAMONGAN
                </div>
                <h1 className="text-3xl md:text-6xl lg:text-8xl font-black text-white leading-tight tracking-tighter">
                  {slide.title}
                </h1>
                <p className="text-sm md:text-xl text-slate-200 font-bold max-w-xl border-l-4 border-amber-500 pl-3 md:pl-6 backdrop-blur-sm bg-black/10 py-2 md:py-4 rounded-r-xl md:rounded-r-2xl">
                  {slide.subtitle}
                </p>
                <div className="pt-2 md:pt-4 flex items-center gap-4 md:gap-6">
                  <Link href={user ? "/dashboard" : (slide.link || "/login")} className="px-6 md:px-10 py-3 md:py-5 bg-white text-slate-900 font-black text-sm md:text-lg rounded-2xl md:rounded-3xl hover:bg-indigo-500 hover:text-white transition-all transform hover:-translate-y-2 shadow-2xl active:scale-90 flex items-center gap-2 md:gap-3 group">
                    {user ? "Masuk Dashboard" : (slide.cta_text || slide.cta || "Mulai Sekarang")} <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <div className="absolute bottom-6 md:bottom-12 right-4 md:right-12 z-30 flex items-center gap-2 md:gap-4">
          <button onClick={prevSlide} className="h-10 w-10 md:h-14 md:w-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all active:scale-90 shadow-2xl">
            <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
          </button>
          <button onClick={nextSlide} className="h-10 w-10 md:h-14 md:w-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all active:scale-90 shadow-2xl">
            <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-6 md:bottom-12 left-4 md:left-12 z-30 flex gap-2">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-8 md:w-12 bg-amber-500' : 'w-3 md:w-4 bg-white/30'}`}
            />
          ))}
        </div>
      </header>

      {/* Global Search Section */}
      <section id="search" className="relative -mt-12 md:-mt-20 z-30 px-4 md:px-6 lg:px-12 mb-16 md:mb-32">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white p-2 md:p-4 rounded-2xl md:rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col md:flex-row gap-2 md:gap-4">
            <div className="flex-1 flex items-center gap-2 md:gap-4 px-3 md:px-6 py-2 md:py-0 bg-slate-50 rounded-xl md:rounded-[2.5rem] border border-slate-100 group focus-within:ring-4 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <Search className="h-5 w-5 md:h-6 md:w-6 text-slate-400 group-focus-within:text-indigo-600" />
              <input
                type="text"
                placeholder="Apa yang ingin Anda pelajari hari ini?"
                className="flex-1 py-3 md:py-6 bg-transparent outline-none font-bold text-sm md:text-base text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex p-1 gap-1 bg-slate-50 rounded-xl md:rounded-[2.5rem] border border-slate-100">
              <button
                onClick={() => setActiveTab('webinar')}
                className={`px-4 md:px-8 py-2 md:py-4 rounded-lg md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${activeTab === 'webinar' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-indigo-500'}`}
              >
                WEBINAR
              </button>
              <button
                onClick={() => setActiveTab('pembelajaran')}
                className={`px-4 md:px-8 py-2 md:py-4 rounded-lg md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${activeTab === 'pembelajaran' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-indigo-500'}`}
              >
                E-LEARNING
              </button>
            </div>
            <button className="px-6 md:px-10 py-3 md:py-6 bg-indigo-600 text-white rounded-xl md:rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95">
              CARI SEKARANG
            </button>
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <section id="programs" className="px-4 md:px-6 lg:px-12 py-16 md:py-32 bg-slate-50/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-16 md:space-y-32 relative z-10">

          {/* Section 1: Webinar */}
          <div className="space-y-6 md:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-4 md:pb-8 gap-2">
              <div className="space-y-1 md:space-y-2">
                <h4 className="text-xs md:text-sm font-black text-indigo-600 uppercase tracking-widest">LIVE EVENT</h4>
                <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight">Webinar Unggulan</h2>
              </div>
              <Link href="/webinar" className="flex items-center gap-2 font-black text-indigo-600 border-b-2 border-indigo-600 pb-1 hover:gap-4 transition-all uppercase text-xs tracking-widest">
                Lihat Semua Jadwal <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-2xl md:rounded-[3rem] animate-pulse" />)
              ) : featuredWebinars.length > 0 ? (
                featuredWebinars.map((webinar) => (
                  <div key={webinar.id} className="group relative bg-white rounded-2xl md:rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                    <div className="aspect-video overflow-hidden">
                      <img src={webinar.gambar || `https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={webinar.nama_webinar} />
                    </div>
                    <div className="p-4 md:p-10 space-y-3 md:space-y-6">
                      <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black text-slate-400 tracking-widest uppercase">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-indigo-600" /> {new Date(webinar.tanggal_mulai).toLocaleDateString('id-ID')}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-indigo-600" /> {webinar.waktu}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">{webinar.kategori || 'UMUM'}</span>
                      </div>
                      <h4 className="text-lg md:text-2xl font-black text-slate-900 leading-[1.1] group-hover:text-indigo-600 transition-colors line-clamp-2">{webinar.nama_webinar}</h4>
                      <div className="flex items-center justify-between pt-2 md:pt-4">
                        <div className="text-[10px] md:text-xs font-black text-emerald-600 bg-emerald-50 px-2 md:px-3 py-1 rounded-lg uppercase tracking-tighter italic">LIVE STREAMING</div>
                        <Link href={`/webinar/${webinar.id}`} className="h-10 w-10 md:h-12 md:w-12 bg-slate-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-90">
                          <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 md:py-20 text-center font-black text-slate-300 uppercase italic text-sm md:text-base">Belum ada webinar aktif minggu ini</div>
              )}
            </div>
          </div>

          {/* Section 2: Pembelajaran Mandiri */}
          <div className="space-y-6 md:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-4 md:pb-8 gap-2">
              <div className="space-y-1 md:space-y-2">
                <h4 className="text-xs md:text-sm font-black text-emerald-600 uppercase tracking-widest">E-LEARNING</h4>
                <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight">Katalog Pembelajaran</h2>
              </div>
              <Link href="/pembelajaran" className="flex items-center gap-2 font-black text-emerald-600 border-b-2 border-emerald-600 pb-1 hover:gap-4 transition-all uppercase text-xs tracking-widest">
                Lihat Semua Kursus <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-2xl md:rounded-[3rem] animate-pulse" />)
              ) : featuredCourses.length > 0 ? (
                featuredCourses.map((course) => (
                  <div key={course.id} className="group relative bg-white p-3 md:p-5 rounded-2xl md:rounded-[4rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                    <div className="aspect-[4/3] rounded-xl md:rounded-[3rem] overflow-hidden mb-4 md:mb-8">
                      <img src={course.gambar || `https://images.unsplash.com/photo-1434031211128-a391111cbb1b?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={course.nama} />
                    </div>
                    <div className="px-2 md:px-5 pb-2 md:pb-5 space-y-3 md:space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-slate-900 text-white font-black px-3 py-1 rounded-full uppercase tracking-widest italic">{course.kategori || 'INTI'}</span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-500"><Star className="h-3 w-3 fill-amber-500" /> 4.9</span>
                      </div>
                      <h4 className="text-lg md:text-2xl font-black text-slate-900 leading-tight line-clamp-2">{course.nama}</h4>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 pt-3 md:pt-6">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ESTIMASI</p>
                          <p className="text-xs md:text-sm font-black text-slate-900 tracking-tighter">8 Jam • 12 Materi</p>
                        </div>
                        <Link href={`/pembelajaran/${course.id}`} className="px-4 md:px-6 py-2 md:py-3 bg-indigo-50 text-indigo-600 font-black text-[10px] md:text-xs rounded-xl md:rounded-2xl hover:bg-indigo-600 hover:text-white shadow-lg shadow-indigo-100 transition-all flex items-center gap-2">
                          BELAJAR <PlayCircle className="h-3 w-3 md:h-4 md:w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 md:py-20 text-center font-black text-slate-300 uppercase italic text-sm md:text-base">Katalog kurikulum belum tersedia</div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 md:py-32 px-4 md:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-20">
          <div className="md:col-span-2 space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
              <img src="/surajaya_corpu.webp" alt="Logo" className="h-10 md:h-12 w-auto" />
              <span className="text-xl md:text-2xl font-black tracking-tighter italic">SURAJAYA CORPU</span>
            </div>
            <p className="text-slate-400 font-bold max-w-sm leading-relaxed uppercase text-[10px] tracking-widest italic">Kawah Candradimuka Pengembangan Kompetensi ASN <br />Kabupaten Lamongan.</p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center text-xs font-black">X{i}</div>)}
            </div>
          </div>
          <div className="space-y-6 md:space-y-8">
            <h5 className="text-sm font-black uppercase tracking-widest text-indigo-400">Navigasi</h5>
            <ul className="space-y-3 md:space-y-4 text-slate-400 font-bold text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Utama</Link></li>
              <li><Link href="/webinar" className="hover:text-white transition-colors">Webinar</Link></li>
              <li><Link href="/pembelajaran" className="hover:text-white transition-colors">E-Learning</Link></li>
              <li><Link href="/profil" className="hover:text-white transition-colors">Bantuan</Link></li>
            </ul>
          </div>
          <div className="space-y-6 md:space-y-8">
            <h5 className="text-sm font-black uppercase tracking-widest text-indigo-400">Hubungi Kami</h5>
            <ul className="space-y-3 md:space-y-4 text-slate-400 font-bold text-sm">
              <li className="flex flex-col">
                <span className="text-[10px] text-slate-600">EMAIL SUPPORT</span>
                <span>bkpsdm@lamongankab.go.id</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] text-slate-600">LOKASI</span>
                <span>Gedung Pemda Kab. Lamongan Lantai 6, Jl. KH. Ahmad Dahlan No. 1, Lamongan</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 md:pt-20 mt-12 md:mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">&copy; 2026 PEMERINTAH KABUPATEN LAMONGAN. ALL RIGHTS RESERVED.</p>
          <p className="text-[10px] font-black text-amber-500 italic uppercase">Optimized with Advanced Agentic Coding Technology</p>
        </div>
      </footer>
    </div>
  )
}
