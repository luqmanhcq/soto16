'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { ShieldCheck, ArrowRight, Award, Users, Target, Zap } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white selection:bg-indigo-500 selection:text-white w-full overflow-x-hidden">
            <Navbar />

            <main className="pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-16 w-full overflow-hidden">
                {/* Hero */}
                <section className="px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center py-6 sm:py-8 md:py-10">
                        <div className="space-y-5 sm:space-y-6 min-w-0 order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Profil Platform Terintegrasi</span>
                            </div>
                            <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.9] break-words">
                                SURAJAYA<span className="text-indigo-600">CORPU.</span>
                            </h1>
                            <p className="text-[13px] sm:text-base md:text-lg text-slate-600 font-semibold leading-relaxed border-l-2 sm:border-l-4 border-indigo-100 pl-4 sm:pl-6">
                                Sistem Informasi - Strategi Optimalisasi Talenta Organisasi adalah platform digital terintegrasi yang menjadi kawah candradimuka bagi pengembangan kompetensi ASN di lingkungan Pemerintah Kabupaten Lamongan.
                            </p>
                            <p className="text-[13px] sm:text-sm text-slate-500 font-medium leading-relaxed">
                                Lahir dari semangat inisiasi Corporate University (Corpu), Surajaya Corpu hadir sebagai "wadah kolaborasi" yang menyatukan berbagai potensi pegawai menjadi satu harmoni kekuatan organisasi.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Link href="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-sm hover:bg-indigo-600 transition-colors active:scale-[0.98] w-full sm:w-auto">
                                    Gabung Sekarang <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href="/webinar" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl sm:rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors w-full sm:w-auto">
                                    Jelajahi Webinar
                                </Link>
                            </div>
                        </div>
                        <div className="relative min-w-0 order-1 lg:order-2">
                            <div className="aspect-square max-w-[420px] mx-auto lg:max-w-none bg-slate-50 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm p-6 sm:p-8 md:p-10">
                                <Image src="/surajaya_corpu.webp" className="w-full h-full object-contain" alt="Logo Surajaya Corpu" width={600} height={600} priority={true} unoptimized />
                            </div>
                            <div className="absolute -bottom-3 -left-2 sm:-bottom-4 sm:-left-4 bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 leading-none">Corpu</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Initiative Spirit</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4 Pilar */}
                <section className="mt-8 sm:mt-12">
                    <div className="mx-4 sm:mx-6 lg:mx-8 bg-slate-900 rounded-2xl sm:rounded-3xl lg:rounded-[2rem] px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
                            <span className="text-[8rem] sm:text-[12rem] lg:text-[16rem] font-black text-white leading-none select-none">CORPU</span>
                        </div>
                        <div className="max-w-7xl mx-auto relative z-10 space-y-8 sm:space-y-10 w-full min-w-0">
                            <div className="text-center space-y-3 max-w-2xl mx-auto">
                                <h2 className="text-[22px] sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">Makna Konseptual Surajaya Corpu</h2>
                                <p className="text-indigo-400 font-bold uppercase tracking-widest text-[11px] sm:text-xs">Empat Pilar Utama Ekosistem Pembelajaran</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full">
                                <PilarCard letter="S" title="Strategi" desc="Menyelaraskan pengembangan kompetensi ASN dengan arah pembangunan daerah." />
                                <PilarCard letter="O" title="Optimalisasi" desc="Memastikan setiap ASN memperoleh pengembangan yang tepat guna dan tepat sasaran." />
                                <PilarCard letter="T" title="Talenta" desc="Mengidentifikasi dan mengembangkan potensi unik sebagai aset strategis daerah." />
                                <PilarCard letter="O" title="Organisasi" desc="Mewujudkan birokrasi yang adaptif, profesional, dan berdaya saing global." />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ASN BANGKIT */}
                <section className="px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto w-full mt-12 sm:mt-16 md:mt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
                        <div className="relative min-w-0 order-2 lg:order-1">
                            <div className="aspect-[4/5] max-h-[520px] lg:max-h-none rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 relative">
                                <Image src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070" className="w-full h-full object-cover opacity-50" alt="ASN Bangkit" width={800} height={1000} loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10">
                                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-none tracking-tight">ASN<br />BANGKIT!</h3>
                                    <p className="mt-3 text-[13px] sm:text-sm text-white/80 font-semibold border-l-2 border-white/30 pl-3 leading-relaxed">"Belajar tanpa batas, berkarya dengan tuntas, untuk Lamongan Megilan!"</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 sm:space-y-8 min-w-0 order-1 lg:order-2">
                            <div className="h-1 bg-indigo-600 w-12 sm:w-16 rounded-full" />
                            <h2 className="text-[22px] sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">Pengembangan Kompetensi Berbasis Online</h2>
                            <p className="text-[13px] sm:text-sm md:text-base text-slate-600 font-semibold leading-relaxed">
                                Program pengembangan kompetensi rutin melalui metode pembelajaran jarak jauh (Webinar) untuk mencetak ASN yang profesional dan siap menghadapi dinamika perubahan zaman.
                            </p>
                            <div className="grid gap-4 sm:gap-5">
                                <FeatureItem title="Bangun (Fondasi)" desc="Investasi jangka panjang untuk membangun fondasi SDM yang kokoh." />
                                <FeatureItem title="Akselerasi (Kecepatan)" desc="Transfer ilmu secara masif dan efisien tanpa sekat ruang melalui webinar." />
                                <FeatureItem title="Nilai Guna (Kemanfaatan)" desc="Ilmu yang didapat harus memberikan utilitas nyata bagi pelayanan publik." />
                                <FeatureItem title="KOMPETENSI, INOVASI & TALENTA" desc="Penguatan Kompetensi, stimulasi Inovasi, dan pemetaan Talenta." />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Kurikulum & Tim */}
                <section className="mt-12 sm:mt-16 md:mt-20 bg-slate-50 w-full overflow-hidden">
                    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-12 md:py-16 max-w-7xl mx-auto w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                            <div className="space-y-6 min-w-0">
                                <h2 className="text-[22px] sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">Kurikulum<br className="hidden sm:block" /> & Tema</h2>
                                <p className="text-[13px] sm:text-sm text-slate-500 font-medium leading-relaxed">Pedoman penyelenggaraan kegiatan pembelajaran untuk mencapai tujuan pendidikan strategis.</p>
                                <div className="space-y-3">
                                    {['Tujuan Pembelajaran', 'Materi & Isi', 'Metode & Strategi', 'Media & Sumber Belajar', 'Evaluasi & Penilaian'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-xs font-black text-slate-700 uppercase tracking-widest">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                                            <span className="truncate">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
                                <TeamRoleCard role="Penanggung Jawab" desc="Bertanggung jawab atas keseluruhan pelaksanaan kegiatan webinar." />
                                <TeamRoleCard role="Ketua Pelaksana" desc="Mengkoordinasikan persiapan, menentukan Tema dan Narasumber." />
                                <TeamRoleCard role="Koordinator" desc="Penyusunan rundown, pendaftaran, daftar hadir, dan evaluasi." />
                                <TeamRoleCard role="Moderator / Host" desc="Memandu jalannya kegiatan serta mengatur sesi diskusi dan tanya jawab." />
                                <TeamRoleCard role="Admin & Operator" desc="Persiapan teknis akun Zoom, jaringan, materi, dan pengujian audio/video." />
                                <TeamRoleCard role="Dokumentasi & Publikasi" desc="Mengelola dokumentasi, publikasi, dan penyusunan undangan." />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-start border-t border-slate-200 mt-10 sm:mt-12 md:mt-16 pt-8 sm:pt-10 md:pt-12 w-full">
                            <div className="space-y-5 min-w-0">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">Prosedur Pembelajaran</h3>
                                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                                    {['Pendaftaran', 'Penyampaian Materi', 'Evaluasi', 'Penerbitan Sertifikat'].map((step, i) => (
                                        <div key={i} className="inline-flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
                                            <span className="text-lg font-black text-indigo-100 leading-none">{i + 1}</span>
                                            <span className="font-black text-[11px] sm:text-xs text-slate-700 uppercase tracking-widest">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-5 min-w-0">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">Ekosistem Promosi</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="p-5 rounded-2xl bg-slate-900 text-white">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">DIGITAL ASSET</p>
                                        <p className="mt-1 font-black text-sm uppercase leading-tight">Poster & Media Sosial</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-indigo-600 text-white">
                                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">CERTIFICATE</p>
                                        <p className="mt-1 font-black text-sm uppercase leading-tight">Desain Sertifikat Digital</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600"><Target className="h-3.5 w-3.5 text-indigo-500" /> Tepat Sasaran</span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600"><Users className="h-3.5 w-3.5 text-indigo-500" /> Kolaboratif</span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600"><Zap className="h-3.5 w-3.5 text-amber-500" /> Akseleratif</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mt-10 sm:mt-12 md:mt-16">
                    <div className="bg-indigo-600 rounded-2xl sm:rounded-3xl lg:rounded-[2rem] p-6 sm:p-10 md:p-12 lg:p-14 text-center text-white space-y-5 sm:space-y-6 shadow-lg relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-indigo-800/50 blur-2xl" />
                        <div className="relative">
                            <h2 className="text-[22px] sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">Jadilah bagian dari perubahan besar ini.</h2>
                            <p className="text-[13px] sm:text-sm md:text-base text-indigo-100 font-semibold max-w-xl mx-auto leading-relaxed mt-3">"Optimalisasi Talenta untuk Birokrasi yang Berdaya Saing Global."</p>
                            <Link href="/register" className="mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-slate-900 hover:text-white transition-colors active:scale-[0.98]">
                                MULAI BELAJAR <ArrowRight className="h-5 w-5" />
                            </Link>
                            <p className="mt-4 text-[11px] font-bold tracking-widest uppercase text-indigo-200">Gratis untuk ASN Kabupaten Lamongan</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="text-center py-8 sm:py-10 border-t border-slate-100 bg-white w-full overflow-hidden">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4">&copy; 2026 BKPSDM Kabupaten Lamongan.</p>
            </footer>
        </div>
    )
}

function PilarCard({ letter, title, desc }: any) {
    return (
        <div className="p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl space-y-4 hover:bg-white/[0.08] transition-colors group w-full min-w-0 overflow-hidden backdrop-blur-sm">
            <div className="text-4xl sm:text-5xl font-black text-indigo-400 leading-none group-hover:text-indigo-300 transition-colors">{letter}</div>
            <div className="space-y-1.5 min-w-0">
                <h4 className="text-[15px] sm:text-base font-black text-white uppercase tracking-tight truncate">{title}</h4>
                <p className="text-[13px] sm:text-sm text-slate-400 font-medium leading-relaxed break-words">{desc}</p>
            </div>
        </div>
    )
}

function FeatureItem({ title, desc }: any) {
    return (
        <div className="flex gap-3 items-start min-w-0">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
            <div className="space-y-1 min-w-0">
                <h5 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest leading-tight break-words">{title}</h5>
                <p className="text-[13px] sm:text-sm text-slate-500 font-medium leading-relaxed break-words">{desc}</p>
            </div>
        </div>
    )
}

function TeamRoleCard({ role, desc }: any) {
    return (
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all min-w-0 w-full overflow-hidden">
            <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest truncate">{role}</h4>
            <p className="mt-2 text-[13px] sm:text-sm text-slate-600 font-medium leading-relaxed break-words">{desc}</p>
        </div>
    )
}
