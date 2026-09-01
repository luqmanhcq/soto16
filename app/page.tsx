'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import {
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  PlayCircle,
  Star,
  ArrowUpRight,
  ExternalLink,
  Globe,
} from 'lucide-react'

// --- LINK PEMBELAJARAN LAINNYA ---
const LEARNING_LINKS = [
  {
    id: 1,
    name: 'Si Bangkom',
    short: 'sibangkom.lan.go.id',
    desc: 'Sistem Informasi Bangkom',
    url: 'https://sibangkom.lan.go.id/',
    bg: 'bg-blue-50',
    color: 'text-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="5" cy="19" r="2.5" />
        <circle cx="19" cy="19" r="2.5" />
        <path d="M12 7.5V12M7.5 16.5 11 13M16.5 16.5 13 13" />
      </svg>
    )
  },
  {
    id: 2,
    name: 'Semesta Bangkom',
    short: 'semestabangkom.id',
    desc: 'Bangkom Terpadu',
    url: 'https://semestabangkom.id/',
    bg: 'bg-teal-50',
    color: 'text-teal-600',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7v10" />
        <path d="M5 17V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11" />
        <path d="M5 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2" />
        <path d="M12 7 7 5.5" />
        <path d="M12 7 17 5.5" />
      </svg>
    )
  },
  {
    id: 3,
    name: 'ASN Future Skills',
    short: 'asn.futureskills.id',
    desc: 'Future Skills ASN',
    url: 'https://asn.futureskills.id',
    bg: 'bg-purple-50',
    color: 'text-purple-600',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 13a9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9Z" />
        <path d="M14 5l3 3M9 9l3 3" />
        <path d="M5 14 8 11 11 14 8 17 5 14Z" />
        <path d="M19 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    )
  },
  {
    id: 4,
    name: 'KLCK Kemenkeu',
    short: 'klc2.kemenkeu.go.id',
    desc: 'Kementerian Keuangan',
    url: 'https://klc2.kemenkeu.go.id/ ',
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  },
  {
    id: 5,
    name: 'BKN Pedia',
    short: 'bknpedia.bkn.go.id',
    desc: 'Badan Kepegawaian Negara',
    url: 'https://bknpedia.bkn.go.id/ ',
    bg: 'bg-amber-50',
    color: 'text-amber-600',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
        <path d="M12 7v10" />
        <path d="M8 7h8M8 11h8" />
      </svg>
    )
  },
  {
    id: 6,
    name: 'InaGov',
    short: 'inagov.go.id',
    desc: 'Inovasi Pemerintah',
    url: 'https://inagov.go.id/',
    bg: 'bg-rose-50',
    color: 'text-rose-600',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l7-4v18M19 21V7l-7-4v18M12 12h.01" />
      </svg>
    )
  },
  {
    id: 7,
    name: 'Digital Talent',
    short: 'digitalent.komdigi.go.id',
    desc: 'Komdigi Digital Talent',
    url: 'https://digitalent.komdigi.go.id/',
    bg: 'bg-violet-50',
    color: 'text-violet-600',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M9 9h6v6H9zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
      </svg>
    )
  }
]

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

  useEffect(() => {
    const slidesCount = heroSlides.length > 0 ? heroSlides.length : FALLBACK_SLIDES.length
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesCount)
    }, 6000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

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
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      <Navbar />

      {/* Hero Carousel - mobile optimized */}
      <header className="relative h-[62vh] min-h-[420px] sm:h-[68vh] md:h-[82vh] overflow-hidden group w-full">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03] pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-slate-900/20 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-10" />
            <Image src={slide.image} className="w-full h-full object-cover" alt={slide.title} fill sizes="100vw" style={{objectFit: 'cover'}} priority={index===0} />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-24">
              <div className="max-w-3xl space-y-3 sm:space-y-5 md:space-y-6 w-full min-w-0">
                <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-500 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  PROGRAM UNGGULAN PEMKAB LAMONGAN
                </div>
                <h1 className="text-[26px] leading-[0.95] sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-[13px] sm:text-base md:text-lg text-white/90 font-semibold max-w-xl border-l-[3px] border-amber-500 pl-3 sm:pl-5 bg-black/10 backdrop-blur-sm py-2 sm:py-3 rounded-r-xl leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <Link href={user ? "/dashboard" : (slide.link || "/login")} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-slate-900 font-black text-sm rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-[0.98] group">
                    {user ? "Masuk Dashboard" : (slide.cta_text || slide.cta || "Mulai Sekarang")} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                    <div className="h-7 w-7 rounded-lg overflow-hidden bg-white p-0.5">
                      <Image src="/surajaya_corpu.webp" alt="Logo" className="h-full w-full object-contain" width={28} height={28} unoptimized />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Surajaya Corpu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-12 z-30 flex items-center gap-2">
          <button onClick={prevSlide} aria-label="Slide sebelumnya" className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all active:scale-90">
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button onClick={nextSlide} aria-label="Slide berikutnya" className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all active:scale-90">
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-12 z-30 flex gap-1.5 sm:gap-2">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Ke slide ${i+1}`}
              className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-7 sm:w-8 md:w-10 bg-amber-500' : 'w-2.5 sm:w-3 bg-white/40'}`}
            />
          ))}
        </div>
      </header>

      {/* Search */}
      <section id="search" className="relative -mt-6 sm:-mt-8 md:-mt-12 z-30 px-4 sm:px-6 lg:px-12 mb-10 sm:mb-16 md:mb-20 w-full max-w-full overflow-hidden">
        <div className="max-w-5xl mx-auto w-full">
          <div className="bg-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] border border-slate-100 flex flex-col md:flex-row gap-2 sm:gap-3 w-full overflow-hidden">
            <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 shrink-0" />
              <input
                type="text"
                placeholder="Apa yang ingin Anda pelajari hari ini?"
                className="flex-1 min-w-0 py-3 bg-transparent outline-none font-bold text-[13px] sm:text-sm md:text-base text-slate-700 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex p-1 gap-1 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 shrink-0">
              <button
                onClick={() => setActiveTab('webinar')}
                className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all ${activeTab === 'webinar' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
              >
                WEBINAR
              </button>
              <button
                onClick={() => setActiveTab('pembelajaran')}
                className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all ${activeTab === 'pembelajaran' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
              >
                E-LEARNING
              </button>
            </div>
            <button className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-slate-900 transition-colors active:scale-[0.98] shrink-0">
              CARI SEKARANG
            </button>
          </div>
        </div>
      </section>

      {/* Main Listing */}
      <section id="programs" className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 md:py-20 bg-slate-50/50 relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-10%,rgba(79,70,229,0.08),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16 md:space-y-20 relative z-10 w-full min-w-0">

          <div className="space-y-5 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4 sm:pb-6">
              <div className="space-y-1 min-w-0">
                <h4 className="text-[11px] sm:text-xs font-black text-indigo-600 uppercase tracking-widest">LIVE EVENT</h4>
                <h2 className="text-[22px] sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Webinar Unggulan</h2>
              </div>
              <Link href="/webinar" className="self-start sm:self-auto inline-flex items-center gap-1.5 font-black text-indigo-600 border-b-2 border-indigo-600 pb-1 hover:gap-2 transition-all uppercase text-[11px] sm:text-xs tracking-widest shrink-0">
                Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="aspect-[4/3] bg-white rounded-2xl animate-pulse border border-slate-100" />)
              ) : featuredWebinars.length > 0 ? (
                featuredWebinars.map((webinar) => (
                  <div key={webinar.id} className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col w-full min-w-0">
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      <Image src={webinar.gambar || `https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={webinar.nama_webinar} width={800} height={450} loading="lazy" />
                    </div>
                    <div className="p-4 sm:p-5 md:p-6 space-y-3 flex-1 flex flex-col min-w-0">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                        <span className="flex items-center gap-1.5 truncate"><Calendar className="h-3 w-3 text-indigo-600 shrink-0" /> {new Date(webinar.tanggal_mulai).toLocaleDateString('id-ID')}</span>
                        <span className="flex items-center gap-1.5 shrink-0"><Clock className="h-3 w-3 text-indigo-600" /> {webinar.waktu || '09:00'}</span>
                      </div>
                      <span className="self-start inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">{webinar.kategori || 'UMUM'}</span>
                      <h4 className="text-[15px] sm:text-lg md:text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 min-w-0">{webinar.nama_webinar}</h4>
                      <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-50">
                        <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">LIVE</div>
                        <Link href={`/webinar/${webinar.id}`} className="h-9 w-9 sm:h-10 sm:w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-colors active:scale-90 shrink-0">
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center font-bold text-slate-400 text-sm">Belum ada webinar aktif minggu ini</div>
              )}
            </div>
          </div>

          <div className="space-y-5 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4 sm:pb-6">
              <div className="space-y-1 min-w-0">
                <h4 className="text-[11px] sm:text-xs font-black text-emerald-600 uppercase tracking-widest">E-LEARNING</h4>
                <h2 className="text-[22px] sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Katalog Pembelajaran</h2>
              </div>
              <Link href="/pembelajaran" className="self-start sm:self-auto inline-flex items-center gap-1.5 font-black text-emerald-600 border-b-2 border-emerald-600 pb-1 hover:gap-2 transition-all uppercase text-[11px] sm:text-xs tracking-widest shrink-0">
                Lihat Semua Kursus <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="aspect-[4/3] bg-white rounded-2xl animate-pulse border border-slate-100" />)
              ) : featuredCourses.length > 0 ? (
                featuredCourses.map((course) => (
                  <div key={course.id} className="group relative bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col w-full min-w-0">
                    <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100">
                      <Image src={course.gambar || `https://images.unsplash.com/photo-1434031211128-a391111cbb1b?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.nama} width={800} height={600} loading="lazy" />
                    </div>
                    <div className="px-1 sm:px-2 pt-3 sm:pt-4 pb-1 space-y-3 flex-1 flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-900 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-widest">{course.kategori || 'INTI'}</span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-500"><Star className="h-3 w-3 fill-amber-500" /> 4.9</span>
                      </div>
                      <h4 className="text-[15px] sm:text-lg md:text-xl font-black text-slate-900 leading-tight line-clamp-2 min-w-0">{course.nama}</h4>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ESTIMASI</p>
                          <p className="text-xs sm:text-sm font-black text-slate-900 truncate">8 Jam • 12 Materi</p>
                        </div>
                        <Link href={`/pembelajaran/${course.id}`} className="shrink-0 px-4 py-2.5 bg-indigo-50 text-indigo-600 font-black text-[11px] sm:text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1.5">
                          BELAJAR <PlayCircle className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center font-bold text-slate-400 text-sm">Katalog kurikulum belum tersedia</div>
              )}
            </div>
          </div>

          <div className="space-y-5 sm:space-y-8">
            <div className="flex flex-col gap-3">
              <div className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-violet-200 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <Globe className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-[11px] font-black uppercase tracking-widest text-violet-700">Platform Eksternal</span>
              </div>
              <h2 className="text-[22px] sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Terhubung ke <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Pembelajaran Lain</span>
              </h2>
              <p className="text-[13px] sm:text-sm md:text-base font-medium text-slate-500 max-w-2xl">Jelajahi 7 portal pembelajaran terpercaya dari instansi pemerintah — langsung terhubung, tanpa batas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
              {LEARNING_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden w-full min-w-0"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${link.color === 'text-blue-600' ? '#2563eb' : link.color === 'text-teal-600' ? '#0d9488' : link.color === 'text-purple-600' ? '#9333ea' : link.color === 'text-emerald-600' ? '#059669' : link.color === 'text-amber-600' ? '#d97706' : link.color === 'text-rose-600' ? '#e11d48' : '#7c3aed'}, transparent)` }} />
                  <div className="flex items-start justify-between gap-3">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl ${link.bg} ${link.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                      {link.icon}
                    </div>
                    <span className="h-7 w-7 rounded-full bg-slate-900 text-white hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 flex-1 min-w-0">
                    <h5 className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors truncate">{link.name}</h5>
                    <p className="text-xs font-bold text-slate-400 truncate">{link.desc}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 truncate">{link.short}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">
                    Buka Platform <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </section>

      <footer className="bg-slate-900 text-white py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 w-full min-w-0">
          <div className="sm:col-span-2 space-y-4 sm:space-y-6 min-w-0">
            <div className="flex items-center gap-3">
              <Image src="/surajaya_corpu.webp" alt="Logo" className="h-9 sm:h-10 w-auto" width={40} height={40} priority={true} unoptimized />
              <span className="text-lg sm:text-xl font-black tracking-tighter italic">SURAJAYA CORPU</span>
            </div>
            <p className="text-slate-400 font-bold max-w-sm leading-relaxed uppercase text-[10px] tracking-widest">Kawah Candradimuka Pengembangan Kompetensi ASN Kabupaten Lamongan.</p>
          </div>
          <div className="space-y-4 min-w-0">
            <h5 className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-400">Navigasi</h5>
            <ul className="space-y-2.5 text-slate-400 font-bold text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Utama</Link></li>
              <li><Link href="/webinar" className="hover:text-white transition-colors">Webinar</Link></li>
              <li><Link href="/pembelajaran" className="hover:text-white transition-colors">E-Learning</Link></li>
              <li><Link href="/profil" className="hover:text-white transition-colors">Bantuan</Link></li>
            </ul>
          </div>
          <div className="space-y-4 min-w-0">
            <h5 className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-400">Hubungi Kami</h5>
            <ul className="space-y-3 text-slate-400 font-bold text-[13px] sm:text-sm">
              <li className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 tracking-widest uppercase">EMAIL SUPPORT</span>
                <span className="break-all">bkpsdm@lamongankab.go.id</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 tracking-widest uppercase">LOKASI</span>
                <span className="leading-relaxed">Gedung Pemda Kab. Lamongan Lantai 6, Jl. KH. Ahmad Dahlan No. 1, Lamongan</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 sm:pt-10 mt-8 sm:mt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-center">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">&copy; 2026 PEMERINTAH KABUPATEN LAMONGAN</p>
          <p className="text-[10px] font-black text-amber-500 uppercase">Optimized for Mobile</p>
        </div>
      </footer>
    </div>
  )
}
