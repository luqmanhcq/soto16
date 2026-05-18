'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import Navbar from '@/components/Navbar'
import {
  ArrowRight,
  Video,
  GraduationCap,
  ShieldCheck,
  Award,
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Clock,
  PlayCircle,
  Filter,
  Star,
  Zap,
  ArrowUpRight,
  Globe,
  Target,
  Users,
  FileCheck
} from 'lucide-react'

// --- FALLBACK DATA (IN CASE API IS EMPTY) ---
const FALLBACK_SLIDES = [
  {
    id: 1,
    title: "SI-SOTO LAMONGAN",
    subtitle: "Strategi Optimalisasi Talenta Organisasi: Kawah candradimuka pengembangan kompetensi ASN untuk Lamongan Megilan.",
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
      <header className="relative h-[85vh] overflow-hidden group">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent z-10" />
            <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 lg:px-24">
              <div className="max-w-3xl space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                  PROGRAM UNGGULAN PEMKAB LAMONGAN
                </div>
                <h1 className="text-6xl lg:text-8xl font-black text-white leading-tight tracking-tighter">
                  {slide.title}
                </h1>
                <p className="text-xl text-slate-200 font-bold max-w-xl border-l-4 border-amber-500 pl-6 backdrop-blur-sm bg-black/10 py-4 rounded-r-2xl">
                  {slide.subtitle}
                </p>
                <div className="pt-4 flex items-center gap-6">
                  <Link href={user ? "/dashboard" : (slide.link || "/login")} className="px-10 py-5 bg-white text-slate-900 font-black text-lg rounded-3xl hover:bg-indigo-500 hover:text-white transition-all transform hover:-translate-y-2 shadow-2xl active:scale-90 flex items-center gap-3 group">
                    {user ? "Masuk Dashboard" : (slide.cta_text || slide.cta || "Mulai Sekarang")} <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <div className="absolute bottom-12 right-12 z-30 flex items-center gap-4">
          <button onClick={prevSlide} className="h-14 w-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all active:scale-90 shadow-2xl">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={nextSlide} className="h-14 w-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all active:scale-90 shadow-2xl">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-12 left-12 z-30 flex gap-2">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-12 bg-amber-500' : 'w-4 bg-white/30'}`}
            />
          ))}
        </div>
      </header>

      {/* Global Search Section */}
      <section id="search" className="relative -mt-20 z-30 px-6 lg:px-12 mb-32">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white p-4 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-4 px-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group focus-within:ring-4 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600" />
              <input
                type="text"
                placeholder="Apa yang ingin Anda pelajari hari ini?"
                className="flex-1 py-6 bg-transparent outline-none font-bold text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex p-1 gap-1 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <button
                onClick={() => setActiveTab('webinar')}
                className={`px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'webinar' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-indigo-500'}`}
              >
                WEBINAR
              </button>
              <button
                onClick={() => setActiveTab('pembelajaran')}
                className={`px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'pembelajaran' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-indigo-500'}`}
              >
                E-LEARNING
              </button>
            </div>
            <button className="px-10 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95">
              CARI SEKARANG
            </button>
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <section id="programs" className="px-6 lg:px-12 py-32 bg-slate-50/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-32 relative z-10">

          {/* Section 1: Webinar */}
          <div className="space-y-12">
            <div className="flex items-end justify-between border-b border-slate-200 pb-8">
              <div className="space-y-2">
                <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest">LIVE EVENT</h4>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Webinar Unggulan</h2>
              </div>
              <Link href="/webinar" className="flex items-center gap-2 font-black text-indigo-600 border-b-2 border-indigo-600 pb-1 hover:gap-4 transition-all uppercase text-xs tracking-widest">
                Lihat Semua Jadwal <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-[3rem] animate-pulse" />)
              ) : featuredWebinars.length > 0 ? (
                featuredWebinars.map((webinar) => (
                  <div key={webinar.id} className="group relative bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                    <div className="aspect-video overflow-hidden">
                      <img src={webinar.gambar || `https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={webinar.nama_webinar} />
                    </div>
                    <div className="p-10 space-y-6">
                      <div className="flex items-center justify-between text-[11px] font-black text-slate-400 tracking-widest uppercase">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-indigo-600" /> {new Date(webinar.tanggal_mulai).toLocaleDateString('id-ID')}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-indigo-600" /> {webinar.waktu}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">{webinar.kategori || 'UMUM'}</span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 leading-[1.1] group-hover:text-indigo-600 transition-colors line-clamp-2">{webinar.nama_webinar}</h4>
                      <div className="flex items-center justify-between pt-4">
                        <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-tighter italic">LIVE STREAMING</div>
                        <Link href={`/webinar/${webinar.id}`} className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-90">
                          <ArrowUpRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center font-black text-slate-300 uppercase italic">Belum ada webinar aktif minggu ini</div>
              )}
            </div>
          </div>

          {/* Section 2: Pembelajaran Mandiri */}
          <div className="space-y-12">
            <div className="flex items-end justify-between border-b border-slate-200 pb-8">
              <div className="space-y-2">
                <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest">E-LEARNING</h4>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Katalog Pembelajaran</h2>
              </div>
              <Link href="/pembelajaran" className="flex items-center gap-2 font-black text-emerald-600 border-b-2 border-emerald-600 pb-1 hover:gap-4 transition-all uppercase text-xs tracking-widest">
                Lihat Semua Kursus <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-[3rem] animate-pulse" />)
              ) : featuredCourses.length > 0 ? (
                featuredCourses.map((course) => (
                  <div key={course.id} className="group relative bg-white p-5 rounded-[4rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                    <div className="aspect-[4/3] rounded-[3rem] overflow-hidden mb-8">
                      <img src={course.gambar || `https://images.unsplash.com/photo-1434031211128-a391111cbb1b?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={course.nama} />
                    </div>
                    <div className="px-5 pb-5 space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-slate-900 text-white font-black px-3 py-1 rounded-full uppercase tracking-widest italic">{course.kategori || 'INTI'}</span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-500"><Star className="h-3 w-3 fill-amber-500" /> 4.9</span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 leading-tight line-clamp-2">{course.nama}</h4>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 pt-6">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ESTIMASI</p>
                          <p className="text-sm font-black text-slate-900 tracking-tighter">8 Jam • 12 Materi</p>
                        </div>
                        <Link href={`/pembelajaran/${course.id}`} className="px-6 py-3 bg-indigo-50 text-indigo-600 font-black text-xs rounded-2xl hover:bg-indigo-600 hover:text-white shadow-lg shadow-indigo-100 transition-all flex items-center gap-2">
                          BELAJAR <PlayCircle className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center font-black text-slate-300 uppercase italic">Katalog kurikulum belum tersedia</div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Identity & Philosophy Spill */}
      <section className="py-40 px-6 lg:px-24 bg-slate-900 relative overflow-hidden rounded-[4rem] mx-6 mb-32">
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
          <Zap className="h-96 w-96 text-white" />
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
          <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-indigo-400 rounded-2xl border border-white/5 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Filosofi Platform</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none uppercase italic">
              SI-SOTO <br /><span className="text-indigo-500">Wadah Kolaborasi.</span>
            </h2>
            <p className="text-xl text-indigo-200/60 font-bold leading-relaxed italic border-l-4 border-indigo-500 pl-8">
              "Bukan sekadar aplikasi pendataan, melainkan kawah candradimuka yang menyatukan potensi ASN menjadi harmoni kekuatan organisasi."
            </p>
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="space-y-2">
                <p className="text-sm font-black text-white uppercase italic tracking-widest">BANGKIT</p>
                <p className="text-xs text-indigo-300 font-bold leading-relaxed">Belajar tanpa batas, berkarya dengan tuntas, untuk Lamongan Megilan!</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-white uppercase italic tracking-widest">OPTIMALISASI</p>
                <p className="text-xs text-indigo-300 font-bold leading-relaxed">Memastikan pengembangan talenta yang tepat guna dan tepat sasaran.</p>
              </div>
            </div>
            <Link href="/tentang" className="inline-flex items-center gap-4 text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-all group">
              Pelajari Makna Konseptual <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-white/10 transition-all group cursor-default text-white">
              <div className="h-12 w-12 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl shadow-indigo-500/20">
                <Target className="h-6 w-6 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Strategi</p>
            </div>
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-white/10 transition-all group cursor-default mt-12 text-white">
              <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl shadow-emerald-500/20">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Optimalisasi</p>
            </div>
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-white/10 transition-all group cursor-default -mt-12 text-white">
              <div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl shadow-amber-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Talenta</p>
            </div>
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-white/10 transition-all group cursor-default text-white">
              <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl shadow-indigo-600/20">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Organisasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Mengapa SI-SOTO?</h2>
            <div className="space-y-10">
              <Benefit icon={Zap} title="Kecepatan Akses" desc="Platform dioptimalkan untuk akses cepat dari mana saja tanpa hambatan teknis." />
              <Benefit icon={Globe} title="Standar Nasional" desc="Kurikulum disusun mengikuti standar peraturan perundang-undangan terbaru." />
              <Benefit icon={ShieldCheck} title="Data Terverifikasi" desc="Sertifikat yang diterbitkan terintegrasi langsung dengan profil kepegawaian Anda." />
            </div>
          </div>
          <div className="relative p-12">
            <div className="absolute inset-0 bg-indigo-600 rounded-[5rem] rotate-3 -z-10 shadow-3xl shadow-indigo-100" />
            <div className="bg-slate-900 rounded-[4rem] p-16 text-white space-y-12">
              <div className="h-20 w-20 bg-indigo-500 rounded-3xl flex items-center justify-center rotate-6">
                <FileCheck className="h-10 w-10" />
              </div>
              <h3 className="text-4xl font-black tracking-tight leading-tight">Mulai Kumpulkan Jam Pelajaran Anda Sekarang.</h3>
              <p className="text-indigo-200 text-lg font-bold opacity-70 italic border-l-2 border-indigo-400 pl-4">"Investasi terbaik bagi seorang ASN adalah pembelajaran yang berkelanjutan."</p>
              {user ? (
                <Link href="/dashboard" className="flex items-center justify-center gap-3 w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xl hover:bg-white hover:text-slate-900 transition-all transform hover:-translate-y-2 shadow-2xl">
                  MASUK KE DASHBOARD <LayoutDashboard className="h-6 w-6" />
                </Link>
              ) : (
                <Link href="/login" className="flex items-center justify-center gap-3 w-full py-6 bg-white text-slate-900 rounded-3xl font-black text-xl hover:bg-indigo-500 hover:text-white transition-all transform hover:-translate-y-2 shadow-2xl">
                  DAFTAR & LOGIN <ArrowRight className="h-6 w-6" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <img src="/logo-soto.png?v=3" alt="Logo" className="h-12 w-auto" />
              <span className="text-2xl font-black tracking-tighter italic">SI-SOTO.</span>
            </div>
            <p className="text-slate-400 font-bold max-w-sm leading-relaxed uppercase text-[10px] tracking-widest italic">Kawah Candradimuka Pengembangan Kompetensi ASN <br />Kabupaten Lamongan.</p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center text-xs font-black">X{i}</div>)}
            </div>
          </div>
          <div className="space-y-8">
            <h5 className="text-sm font-black uppercase tracking-widest text-indigo-400">Navigasi</h5>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><Link href="/" className="hover:text-white transition-colors">Utama</Link></li>
              <li><Link href="/webinar" className="hover:text-white transition-colors">Webinar</Link></li>
              <li><Link href="/pembelajaran" className="hover:text-white transition-colors">E-Learning</Link></li>
              <li><Link href="/profil" className="hover:text-white transition-colors">Bantuan</Link></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h5 className="text-sm font-black uppercase tracking-widest text-indigo-400">Hubungi Kami</h5>
            <ul className="space-y-4 text-slate-400 font-bold">
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
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">&copy; 2026 PEMERINTAH KABUPATEN LAMONGAN. ALL RIGHTS RESERVED.</p>
          <p className="text-[10px] font-black text-amber-500 italic uppercase">Optimized with Advanced Agentic Coding Technology</p>
        </div>
      </footer>
    </div>
  )
}

function Benefit({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-6 group">
      <div className="h-16 w-16 min-w-[64px] rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h5 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h5>
        <p className="text-slate-500 font-bold leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
