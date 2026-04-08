'use client'

import React from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ShieldCheck, Target, Users, Zap, Award, Globe, ArrowLeft, ArrowRight } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white selection:bg-indigo-500 selection:text-white">
            <Navbar />

            <main className="pt-32 pb-40">
                {/* Hero Section */}
                <section className="px-6 lg:px-24 mb-32 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 inline-block px-4 py-1 rounded-lg">PROFIL PLATFORM</h4>
                        <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">Visi Digital <br /><span className="text-indigo-600">Terpadu.</span></h1>
                        <p className="text-xl text-slate-500 font-bold leading-relaxed border-l-4 border-indigo-100 pl-8">SI-SOTO (Strategi Optimalisasi Talenta Organisasi) adalah ekosistem digital revolusioner yang dirancang khusus untuk mengakselerasi pengembangan kompetensi ASN di era industri 4.0.</p>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-slate-100 rounded-[4rem] overflow-hidden rotate-2 shadow-2xl shadow-indigo-100 border-8 border-white">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="About SI-SOTO" />
                        </div>
                    </div>
                </section>

                {/* Visi Misi */}
                <section className="bg-slate-900 py-40 px-6 lg:px-24 relative overflow-hidden rounded-[5rem] mx-6">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <ShieldCheck className="h-[500px] w-[500px] absolute -right-20 -top-20 text-white" />
                    </div>
                    <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-24">
                        <div className="space-y-8 text-white">
                            <Target className="h-16 w-16 text-indigo-400" />
                            <h2 className="text-6xl font-black tracking-tighter">Visi Utama</h2>
                            <p className="text-2xl font-bold text-indigo-200/60 leading-relaxed italic border-b border-white/5 pb-10">"Menjadi pusat inkubasi talenta ASN terbaik yang melahirkan pemimpin masa depan berbasis teknologi dan integritas."</p>
                            <div className="flex gap-10 pt-10">
                                <Stat label="Total Alumni" value="15k+" />
                                <Stat label="Tingkat Kepuasan" value="98%" />
                            </div>
                        </div>
                        <div className="space-y-12">
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">MISI STRATEGIS</h3>
                            <div className="space-y-10">
                                <MisiItem icon={Zap} title="Digitalisasi Pembelajaran" desc="Menyediakan akses webinar dan kursus mandiri berkualitas tinggi yang dapat diakses dari mana saja." />
                                <MisiItem icon={Award} title="Sertifikasi Instan" desc="Mengotomatisasi verifikasi usulan sertifikat eksternal demi keakuratan data Jam Pelajaran." />
                                <MisiItem icon={Globe} title="Konektivitas Sektor" desc="Membangun jejaring antar instansi pemerintah untuk pertukaran pengetahuan yang inklusif." />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tim */}
                <section className="py-40 px-6 lg:px-24">
                    <div className="max-w-7xl mx-auto text-center space-y-24">
                        <div className="space-y-6">
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">PENGGERAK SISTEM</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Kolaborasi Ahli Kebijakan, Teknologi, dan Pengembangan SDM</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-16">
                            <MemberCard name="Dr. Hendra Utama" role="Program Director" image="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200" />
                            <MemberCard name="Siti Amanda, M.Kom" role="Chief Architect" image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200" />
                            <MemberCard name="Budi Santoso" role="Service Lead" image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200" />
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="max-w-5xl mx-auto px-6">
                    <div className="bg-indigo-600 rounded-[4rem] p-20 text-center text-white space-y-10 shadow-3xl shadow-indigo-100">
                        <h2 className="text-5xl font-black tracking-tight leading-none">Jadilah bagian dari perubahan besar ini.</h2>
                        <p className="text-xl text-indigo-100 font-bold opacity-80 max-w-xl mx-auto leading-relaxed">Ekosistem SI-SOTO siap mendukung perjalanan karier Anda menuju standar global.</p>
                        <Link href="/register" className="inline-flex items-center justify-center gap-4 px-12 py-6 bg-white text-indigo-600 rounded-3xl font-black text-2xl hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-2 shadow-2xl group uppercase leading-none">
                            DAFTAR SEKARANG <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="text-center py-20 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-[0.4em] leading-none">&copy; 2026 SI-SOTO PRATAMA DIGITAL. INTEGRITAS TANPA BATAS.</p>
            </footer>
        </div>
    )
}

function Stat({ label, value }: any) {
    return (
        <div className="space-y-1">
            <p className="text-4xl font-black text-white leading-none">{value}</p>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-60">{label}</p>
        </div>
    )
}

function MisiItem({ icon: Icon, title, desc }: any) {
    return (
        <div className="flex gap-6 group">
            <div className="h-16 w-16 min-w-[64px] rounded-2xl bg-white/5 border border-white/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                <Icon className="h-8 w-8" />
            </div>
            <div className="space-y-1">
                <h5 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase leading-tight italic tracking-tight">{title}</h5>
                <p className="text-indigo-300/40 font-bold leading-relaxed text-sm">{desc}</p>
            </div>
        </div>
    )
}

function MemberCard({ name, role, image }: any) {
    return (
        <div className="space-y-6 group cursor-pointer animate-in zoom-in-95 duration-700">
            <div className="aspect-square rounded-[3.5rem] bg-slate-100 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700 border-4 border-transparent group-hover:border-indigo-600">
                <img src={image} className="w-full h-full object-cover scale-150 group-hover:scale-100 transition-transform duration-1000" alt={name} />
            </div>
            <div className="space-y-1">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none italic uppercase">{name}</h4>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{role}</p>
            </div>
        </div>
    )
}
