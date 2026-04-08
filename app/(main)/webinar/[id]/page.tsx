'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    ExternalLink,
    Video,
    FileText,
    ClipboardList,
    Award,
    VideoIcon,
    Play
} from 'lucide-react'
import Link from 'next/link'

export default function WebinarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user } = useAuth()
    const [webinar, setWebinar] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isJoined, setIsJoined] = useState(false)
    const [joining, setJoining] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/webinar/${id}`)
                if (res.ok) {
                    const result = await res.json()
                    setWebinar(result.data)
                    setIsJoined(result.data.isJoined || false)
                }
            } catch (error) {
                console.error('Failed to fetch webinar', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleJoin = async () => {
        setJoining(true)
        try {
            const res = await fetch(`/api/webinar/${id}/join`, { method: 'POST' })
            if (res.ok) {
                setIsJoined(true)
                alert('Berhasil mendaftar webinar!')
            }
        } catch (error) {
            console.error('Failed to join webinar', error)
        } finally {
            setJoining(false)
        }
    }

    if (loading) return <div className="p-20 text-center font-bold text-blue-600 animate-pulse">Menyiapkan detail webinar...</div>
    if (!webinar) return <div className="p-20 text-center font-bold text-red-500">Webinar tidak ditemukan</div>

    const isASN = user?.role === 'asn'

    return (
        <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-12">
            <Link
                href="/webinar"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all mb-4"
            >
                <ArrowLeft className="h-5 w-5" />
                Kembali ke Katalog
            </Link>

            <div className="grid gap-12 lg:grid-cols-3">
                {/* Left/Main Column */}
                <div className="lg:col-span-2 space-y-10">
                    <header className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black tracking-widest uppercase border border-blue-100">
                            {webinar.kategori || 'UMUM'}
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">{webinar.nama_webinar}</h1>
                        <div className="flex flex-wrap gap-8 items-center text-slate-500">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <span className="font-bold text-slate-700">{new Date(webinar.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700">{(webinar.jenis_webinar || 'external').toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Users className="h-5 w-5 text-blue-500" />
                                <span className="font-bold text-slate-700">Kuota: {webinar.kuota || 'Unlimited'} Peserta</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Award className="h-5 w-5 text-blue-500" />
                                <span className="font-bold text-slate-700">Skor Min: {webinar.nilai_min}%</span>
                            </div>
                        </div>
                    </header>

                    <div className="aspect-video w-full rounded-[3rem] bg-slate-900 shadow-2xl relative overflow-hidden group">
                        {webinar.gambar ? (
                            <img src={webinar.gambar} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-90" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                <Play className="h-20 w-20 text-white opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </div>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Deskripsi Kegiatan</h2>
                        <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">{webinar.deskripsi}</div>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Narasumber & Panelis</h2>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {(() => {
                                try {
                                    const narasumber = JSON.parse(webinar.narasumber || '[]')
                                    if (Array.isArray(narasumber) && narasumber.length > 0) {
                                        return narasumber.map((nara, idx) => (
                                            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm ring-1 ring-slate-100 group hover:ring-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                                                <div className="space-y-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black italic">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-slate-900 leading-tight">{nara.nama}</h4>
                                                        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">{nara.jabatan || 'Pembicara'}</p>
                                                        <p className="text-sm font-medium text-slate-500 mt-2">{nara.instansi || 'SI-SOTO'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    throw new Error('Not array or empty')
                                } catch (e) {
                                    // Fallback untuk data lama
                                    const oldData = (webinar.narasumber || 'TBA') as string
                                    const narasList = oldData.includes('###') ? oldData.split('###') : oldData.split(', ')
                                    return narasList.map((nara, idx) => (
                                        <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm ring-1 ring-slate-100">
                                            <div className="space-y-4">
                                                <h4 className="text-xl font-black text-slate-900 leading-tight">{nara}</h4>
                                                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Narasumber Utama</p>
                                            </div>
                                        </div>
                                    ))
                                }
                            })()}
                        </div>
                    </section>

                    <section className="bg-blue-600 p-8 rounded-[2.5rem] text-white">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <Award className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Penyelenggara Kegiatan</h3>
                                <p className="text-2xl font-black">{webinar.penyelenggara || 'SI-SOTO PRATAMA'}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar Column */}
                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-12">
                        <div className="text-center mb-8">
                            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-1">Poin Pengembangan</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-6xl font-black text-blue-600">{webinar.jumlah_jp || 2}</span>
                                <span className="text-2xl font-bold text-slate-800">JP</span>
                            </div>
                        </div>

                        {!isJoined ? (
                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className="w-full bg-blue-600 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {joining ? 'Mendaftar...' : 'DAFTAR SEKARANG'}
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl bg-green-50 text-green-700 text-center font-black border border-green-100 text-sm tracking-widest">
                                    BERHASIL MENDAFTAR (OK)
                                </div>

                                <p className="text-slate-400 font-bold text-[11px] tracking-widest uppercase text-center py-4">Tautan Penting & Sumberdaya</p>

                                {[
                                    ...(webinar.jenis_webinar === 'external' ? [{ name: 'Link Pendaftaran Eksternal', href: webinar.link_daftar, icon: ExternalLink, disabled: !webinar.link_daftar }] : []),
                                    { name: 'Akses Zoom Meeting', href: webinar.link_zoom, icon: VideoIcon, disabled: !webinar.link_zoom },
                                    { name: 'Unduh Materi & PPT', href: webinar.link_materi, icon: FileText, disabled: !webinar.link_materi },
                                    { name: 'Post Test / Tugas', href: webinar.link_post_test, icon: ClipboardList, disabled: !webinar.link_post_test },
                                    { name: 'Formulir Monev', href: webinar.link_monev, icon: ClipboardList, disabled: !webinar.link_monev },
                                    { name: 'Unduh Sertifikat', href: webinar.link_sertifikat, icon: Award, disabled: !webinar.link_sertifikat },
                                ].map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center justify-between p-4 rounded-xl font-bold text-sm border transition-all ${link.disabled
                                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed pointer-events-none'
                                            : 'bg-white text-slate-700 border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon className={`h-5 w-5 ${link.disabled ? 'text-slate-200' : 'text-blue-500'}`} />
                                            {link.name}
                                        </div>
                                        {!link.disabled && <ExternalLink className="h-3 w-3 opacity-50" />}
                                    </a>
                                ))}
                            </div>
                        )}

                        <p className="mt-8 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">
                            DILINDUNGI SISTEM SI-SOTO
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
