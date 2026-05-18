'use client'

import React from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ShieldCheck, Target, Users, Zap, Award, Globe, ArrowLeft, ArrowRight, Video, GraduationCap, FileCheck } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white selection:bg-indigo-500 selection:text-white">
            <Navbar />

            <main className="pt-32 pb-40">
                {/* Hero Section */}
                <section className="px-6 lg:px-24 mb-32 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Profil Platform Terintegrasi</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">SI-<span className="text-indigo-600">SOTO.</span></h1>
                        <p className="text-xl text-slate-500 font-bold leading-relaxed border-l-4 border-indigo-100 pl-8 italic">
                            Sistem Informasi - Strategi Optimalisasi Talenta Organisasi adalah platform digital terintegrasi yang menjadi kawah candradimuka bagi pengembangan kompetensi ASN di lingkungan Pemerintah Kabupaten Lamongan.
                        </p>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-xl">
                            Lahir dari semangat inisiasi Corporate University (Corpu), SI-SOTO hadir sebagai "wadah kolaborasi" yang menyatukan berbagai potensi pegawai menjadi satu harmoni kekuatan organisasi.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-slate-100 rounded-[4rem] overflow-hidden rotate-2 shadow-2xl shadow-indigo-100 border-8 border-white group">
                            <img src="/logo-soto.png" className="w-full h-full object-contain p-12 group-hover:scale-105 transition-all duration-1000" alt="Logo SI-SOTO" />
                        </div>
                        <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 space-y-2 animate-bounce-slow">
                            <p className="text-4xl font-black text-indigo-600 italic leading-none">Corpu</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Initiative Spirit</p>
                        </div>
                    </div>
                </section>

                {/* 4 Pilar Utama */}
                <section className="bg-slate-900 py-40 px-6 lg:px-24 relative overflow-hidden rounded-[5rem] mx-6">
                    <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                        <span className="text-[20rem] font-black text-white italic">SOTO</span>
                    </div>
                    <div className="max-w-7xl mx-auto relative z-10 space-y-20">
                        <div className="text-center space-y-4">
                            <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Makna Konseptual SOTO</h2>
                            <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Empat Pilar Utama Ekosistem Pembelajaran</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <PilarCard
                                letter="S"
                                title="Strategi"
                                desc="Menyelaraskan pengembangan kompetensi ASN dengan arah pembangunan daerah."
                            />
                            <PilarCard
                                letter="O"
                                title="Optimalisasi"
                                desc="Memastikan setiap ASN memperoleh pengembangan yang tepat guna dan tepat sasaran."
                            />
                            <PilarCard
                                letter="T"
                                title="Talenta"
                                desc="Mengidentifikasi dan mengembangkan potensi unik sebagai aset strategis daerah."
                            />
                            <PilarCard
                                letter="O"
                                title="Organisasi"
                                desc="Mewujudkan birokrasi yang adaptif, profesional, dan berdaya saing global."
                            />
                        </div>
                    </div>
                </section>

                {/* ASN BANGKIT Section */}
                <section className="py-40 px-6 lg:px-24 max-w-7xl mx-auto space-y-32">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] bg-indigo-600 rounded-[4rem] overflow-hidden shadow-3xl shadow-indigo-100 group">
                                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070" className="w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-110 transition-transform duration-1000" alt="ASN Bangkit" />
                                <div className="absolute inset-0 flex flex-col justify-end p-12 space-y-4">
                                    <h3 className="text-6xl font-black text-white italic tracking-tighter leading-none uppercase">ASN <br />BANGKIT!</h3>
                                    <p className="text-indigo-100 font-bold italic border-l-2 border-white/30 pl-4">"Belajar tanpa batas, berkarya dengan tuntas, untuk Lamongan Megilan!"</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-10">
                            <div className="h-1 bg-indigo-600 w-24" />
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">Pengembangan Kompetensi Berbasis Online</h2>
                            <p className="text-lg text-slate-500 font-bold leading-relaxed italic">
                                Program pengembangan kompetensi rutin melalui metode pembelajaran jarak jauh (Webinar) untuk mencetak ASN yang profesional dan siap menghadapi dinamika perubahan zaman.
                            </p>
                            <div className="grid gap-6">
                                <FeatureItem title="Bangun (Fondasi)" desc="Investasi jangka panjang untuk membangun fondasi SDM yang kokoh." />
                                <FeatureItem title="Akselerasi (Kecepatan)" desc="Transfer ilmu secara masif dan efisien tanpa sekat ruang melalui webinar." />
                                <FeatureItem title="Nilai Guna (Kemanfaatan)" desc="Ilmu yang didapat harus memberikan utilitas nyata bagi pelayanan publik." />
                                <FeatureItem title="KOMPETENSI, INOVASI DAN TALENTA  (Output)" desc="Penguatan Kompetensi, stimulasi Inovasi, dan pemetaan Talenta." />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Kurikulum & Tim Section */}
                <section className="py-40 bg-slate-50 px-6 lg:px-24">
                    <div className="max-w-7xl mx-auto space-y-40">
                        <div className="grid lg:grid-cols-3 gap-20">
                            <div className="lg:col-span-1 space-y-8">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Kurikulum <br />& Tema</h2>
                                <p className="text-slate-400 font-bold text-sm leading-relaxed">Pedoman penyelenggaraan kegiatan pembelajaran untuk mencapai tujuan pendidikan strategis.</p>
                                <div className="space-y-4">
                                    {['Tujuan Pembelajaran', 'Materi & Isi', 'Metode & Strategi', 'Media & Sumber Belajar', 'Evaluasi & Penilaian'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-black text-slate-700 uppercase tracking-widest">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                                <TeamRoleCard role="Penanggung Jawab" desc="Bertanggung jawab atas keseluruhan pelaksanaan kegiatan webinar." />
                                <TeamRoleCard role="Ketua Pelaksana" desc="Mengkoordinasikan persiapan, menentukan Tema dan Narasumber." />
                                <TeamRoleCard role="Koordinator" desc="Penyusunan rundown, pendaftaran, daftar hadir, dan evaluasi." />
                                <TeamRoleCard role="Moderator / Host" desc="Memandu jalannya kegiatan serta mengatur sesi diskusi dan tanya jawab." />
                                <TeamRoleCard role="Admin & Operator" desc="Persiapan teknis akun Zoom, jaringan, materi, dan pengujian audio/video." />
                                <TeamRoleCard role="Dokumentasi & Publikasi" desc="Mengelola dokumentasi, publikasi, dan penyusunan undangan." />
                            </div>
                        </div>

                        {/* Prosedur & Desain */}
                        <div className="grid md:grid-cols-2 gap-20 items-center border-t border-slate-200 pt-32">
                            <div className="space-y-12">
                                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Prosedur Pembelajaran</h3>
                                <div className="flex flex-wrap gap-4">
                                    {['Pendaftaran', 'Penyampaian Materi', 'Evaluasi', 'Penerbitan Sertifikat'].map((step, i) => (
                                        <div key={i} className="px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/50 flex items-center gap-4">
                                            <span className="text-2xl font-black text-indigo-100 italic">{i + 1}</span>
                                            <span className="font-black text-xs text-slate-700 uppercase tracking-widest">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-12">
                                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Ekosistem Promosi</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-2">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">DIGITAL ASSET</p>
                                        <p className="font-black text-sm uppercase leading-none">Poster & Media Sosial</p>
                                    </div>
                                    <div className="p-6 bg-indigo-600 text-white rounded-3xl space-y-2">
                                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">CERTIFICATE</p>
                                        <p className="font-black text-sm uppercase leading-none">Desain Sertifikat Digital</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="max-w-5xl mx-auto px-6 py-40">
                    <div className="bg-indigo-600 rounded-[4rem] p-20 text-center text-white space-y-10 shadow-3xl shadow-indigo-100">
                        <h2 className="text-5xl font-black tracking-tight leading-none">Jadilah bagian dari perubahan besar ini.</h2>
                        <p className="text-xl text-indigo-100 font-bold opacity-80 max-w-xl mx-auto leading-relaxed italic">"Optimalisasi Talenta untuk Birokrasi yang Berdaya Saing Global."</p>
                        <Link href="/register" className="inline-flex items-center justify-center gap-4 px-12 py-6 bg-white text-indigo-600 rounded-3xl font-black text-2xl hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-2 shadow-2xl group uppercase leading-none">
                            MULAI BELAJAR <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="text-center py-20 border-t border-slate-100 bg-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-[0.4em] leading-none">&copy; 2026 SI-SOTO PEMKAB LAMONGAN. INTEGRITAS TANPA BATAS.</p>
            </footer>
        </div>
    )
}

function PilarCard({ letter, title, desc }: any) {
    return (
        <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6 hover:bg-white/10 transition-all group">
            <div className="text-7xl font-black text-indigo-500 italic opacity-20 group-hover:opacity-100 transition-opacity leading-none">{letter}</div>
            <div className="space-y-2">
                <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{title}</h4>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function FeatureItem({ title, desc }: any) {
    return (
        <div className="flex gap-6 items-start">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-2.5" />
            <div className="space-y-1">
                <h5 className="text-sm font-black text-slate-900 uppercase italic tracking-widest">{title}</h5>
                <p className="text-sm text-slate-400 font-bold leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function TeamRoleCard({ role, desc }: any) {
    return (
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 space-y-2 hover:-translate-y-1 transition-transform">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">{role}</h4>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">{desc}</p>
        </div>
    )
}
