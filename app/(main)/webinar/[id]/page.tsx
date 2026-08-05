'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    ExternalLink,
    Video,
    FileText,
    Play,
    ClipboardCheck,
    MessageSquare,
    ArrowRight,
    Award,
    VideoIcon,
    ClipboardList,
    UserCheck,
    Loader2,
    Youtube,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Webinar Detail Page
 * 
 * Menampilkan detail webinar lengkap dengan:
 * - Info dasar (jadwal, kuota, narasumber)
 * - Opsi untuk mendaftar dan mengikuti webinar
 * - Link ke zoom, youtube, materi, dan lainnya
 * - Status absensi dan sertifikat
 * 
 * CATATAN: Halaman ini dilindungi oleh (main) layout dengan ProtectedRoute,
 * jadi hanya bisa diakses jika user sudah login.
 */
export default function WebinarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    
    // State management
    const [webinar, setWebinar] = useState<any>(null)
    const [webinarLoading, setWebinarLoading] = useState(true)
    const [webinarError, setWebinarError] = useState<string | null>(null)
    const [isJoined, setIsJoined] = useState(false)
    const [isAttended, setIsAttended] = useState(false)
    const [hasPostTest, setHasPostTest] = useState(false)
    const [hasMonev, setHasMonev] = useState(false)
    const [attending, setAttending] = useState(false)
    const [joining, setJoining] = useState(false)

    /**
     * Fetch webinar details dari API
     * Dijalankan sekali ketika id berubah
     */
    const fetchWebinarData = useCallback(async () => {
        try {
            setWebinarLoading(true)
            setWebinarError(null)
            
            const res = await fetch(`/api/webinar/${id}`, { credentials: 'include' })
            if (!res.ok) {
                throw new Error('Gagal mengambil data webinar')
            }
            
            const result = await res.json()
            setWebinar(result.data)
            setIsJoined(result.data.isJoined || false)
            setHasPostTest(result.data.hasPostTest || false)
            setHasMonev(result.data.hasMonev || false)

            // Fetch attendance status (hanya jika user sudah login)
            if (user) {
                const attRes = await fetch(`/api/webinar/${id}/attendance`, { credentials: 'include' })
                if (attRes.ok) {
                    const attData = await attRes.json()
                    setIsAttended(attData.data.isAttended)
                }
            }
        } catch (error) {
            console.error('Failed to fetch webinar:', error)
            setWebinarError('Gagal memuat detail webinar. Silakan coba kembali.')
        } finally {
            setWebinarLoading(false)
        }
    }, [id, user])

    useEffect(() => {
        fetchWebinarData()
    }, [id, fetchWebinarData])

    /**
     * Handle attendance marking
     * User harus sudah join webinar terlebih dahulu
     */
    const handleAttendance = async () => {
        if (!user) {
            alert('Anda harus login terlebih dahulu')
            return
        }

        setAttending(true)
        try {
            const res = await fetch(`/api/webinar/${id}/attendance`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
            
            if (!res.ok) {
                throw new Error('Gagal mencatat absensi')
            }
            
            const result = await res.json()
            setIsAttended(true)
            alert('Absensi berhasil dicatat!')
        } catch (error) {
            console.error('Attendance error:', error)
            alert('Gagal melakukan absensi. Silakan coba lagi.')
        } finally {
            setAttending(false)
        }
    }

    /**
     * Handle webinar registration
     * User harus sudah login terlebih dahulu
     */
    const handleJoin = async () => {
        if (!user) {
            alert('Anda harus login terlebih dahulu')
            router.push('/login')
            return
        }

        setJoining(true)
        try {
            const res = await fetch(`/api/webinar/${id}/join`, { 
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
            
            const contentType = res.headers.get('content-type')
            if (!contentType?.includes('application/json')) {
                throw new Error('Server error: Invalid response format')
            }
            
            const result = await res.json()
            if (!res.ok) {
                throw new Error(result?.message || 'Gagal mendaftar webinar')
            }
            
            setIsJoined(true)
            alert('Berhasil mendaftar webinar!')
        } catch (error: any) {
            console.error('Join error:', error)
            alert(`Gagal mendaftar: ${error.message}`)
        } finally {
            setJoining(false)
        }
    }

    /**
     * Loading state: Waiting for auth check + webinar data
     */
    if (authLoading || webinarLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-slate-600 font-medium">Memuat detail webinar...</p>
                </div>
            </div>
        )
    }

    /**
     * Error state: Webinar not found or fetch failed
     */
    if (webinarError || !webinar) {
        return (
            <div className="p-6 lg:p-12 max-w-7xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-12 text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-slate-900">Webinar Tidak Ditemukan</h1>
                    <p className="text-slate-600">
                        {webinarError || 'Webinar yang Anda cari tidak tersedia.'}
                    </p>
                    <Link
                        href="/webinar"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Kembali ke Katalog
                    </Link>
                </div>
            </div>
        )
    }

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
                        <div className="flex flex-wrap gap-4 md:gap-8 items-center text-slate-500">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <span className="font-bold text-slate-700">
                                    {new Date(webinar.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    {' '}
                                    {new Date(webinar.tanggal_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    {' s/d '}
                                    {new Date(webinar.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    {' '}
                                    {new Date(webinar.tanggal_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Users className="h-5 w-5 text-blue-500" />
                                <span className="font-bold text-slate-700">Kuota: {webinar.kuota || 'Unlimited'} Peserta</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Award className="h-5 w-5 text-blue-500" />
                                <span className="font-bold text-slate-700">{webinar.jumlah_jp || 0} JP</span>
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
                                                        <p className="text-sm font-medium text-slate-500 mt-2">{nara.instansi || 'Surajaya Corpu'}</p>
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
                                <p className="text-2xl font-black">{webinar.penyelenggara || 'SURAJAYA CORPU'}</p>
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

                                {/* Status indicators */}
                                {(() => {
                                    const now = new Date()
                                    const startDate = new Date(webinar.tanggal_mulai)
                                    const endDate = new Date(webinar.tanggal_selesai)
                                    const hasStarted = now >= startDate
                                    const hasEnded = now > endDate
                                    
                                    return (
                                        <div className="space-y-2">
                                            {!hasStarted && (
                                                <div className="p-3 rounded-xl bg-amber-50 text-amber-700 text-center font-bold text-xs border border-amber-100">
                                                    Webinar belum dimulai
                                                </div>
                                            )}
                                            {hasStarted && !hasEnded && (
                                                <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-center font-bold text-xs border border-blue-100">
                                                    Webinar sedang berlangsung
                                                </div>
                                            )}
                                            {hasEnded && (
                                                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-center font-bold text-xs border border-emerald-100">
                                                    Webinar telah selesai
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}

                                <div className="grid gap-4 mt-6">
                                    {(() => {
                                        const now = new Date()
                                        const endDate = new Date(webinar.tanggal_selesai)
                                        const hasEnded = now > endDate
                                        
                                        return (
                                            <>
                                                <Link
                                                    href={hasEnded ? `/webinar/${id}/test?type=post_test` : '#'}
                                                    className={`flex items-center justify-between p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${
                                                        hasEnded 
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
                                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                    }`}
                                                    onClick={(e) => !hasEnded && e.preventDefault()}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <ClipboardCheck className="h-5 w-5" />
                                                        {hasEnded ? 'KERJAKAN POST-TEST' : 'POST-TEST (BELUM TERSEDIA)'}
                                                    </div>
                                                    {hasEnded && <ArrowRight className="h-4 w-4" />}
                                                </Link>
                                                
                                                <Link
                                                    href={hasEnded ? `/webinar/${id}/test?type=monev` : '#'}
                                                    className={`flex items-center justify-between p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${
                                                        hasEnded 
                                                            ? 'bg-white border-2 border-indigo-50 text-indigo-600 hover:border-indigo-600'
                                                            : 'bg-slate-100 border-2 border-slate-200 text-slate-400 cursor-not-allowed'
                                                    }`}
                                                    onClick={(e) => !hasEnded && e.preventDefault()}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <MessageSquare className="h-5 w-5" />
                                                        {hasEnded ? 'ISI MONEV KEGIATAN' : 'MONEV (BELUM TERSEDIA)'}
                                                    </div>
                                                    {hasEnded && <ArrowRight className="h-4 w-4" />}
                                                </Link>
                                            </>
                                        )
                                    })()}
                                </div>

                                {/* Attendance Section */}
                                <div className="mt-4">
                                    {isAttended ? (
                                        <div className="flex items-center justify-center gap-3 p-6 rounded-[2rem] bg-emerald-50 border-2 border-emerald-100 text-emerald-600 font-black text-xs uppercase tracking-widest italic">
                                            <UserCheck className="h-5 w-5" />
                                            ABSENSI BERHASIL (OK)
                                        </div>
                                    ) : (() => {
                                        const now = new Date()
                                        const startDate = new Date(webinar.tanggal_mulai)
                                        const hasStarted = now >= startDate
                                        
                                        return hasStarted ? (
                                            <button
                                                onClick={handleAttendance}
                                                disabled={attending}
                                                className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {attending ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserCheck className="h-5 w-5" />}
                                                    KLIK UNTUK ABSENSI
                                                </div>
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest border border-slate-200 cursor-not-allowed"
                                                title="Absensi tersedia setelah webinar dimulai"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <UserCheck className="h-5 w-5 text-slate-300" />
                                                    ABSENSI (BELUM DIMULAI)
                                                </div>
                                            </button>
                                        )
                                    })()}
                                </div>

                                {/* Certificate Section */}
                                {webinar.template_sertifikat && (() => {
                                    const now = new Date()
                                    const endDate = new Date(webinar.tanggal_selesai)
                                    const isFinished = now > endDate
                                    const canGetCertificate = isFinished && isAttended && hasPostTest && hasMonev
                                    return (
                                        <div className="mt-4">
                                            {canGetCertificate ? (
                                                <Link
                                                    href={`/webinar/${id}/sertifikat`}
                                                    className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Award className="h-5 w-5" />
                                                        CETAK SERTIFIKAT OTOMATIS
                                                    </div>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest border border-slate-200 cursor-not-allowed"
                                                    title={
                                                        !isFinished
                                                            ? 'Sertifikat tersedia setelah acara selesai'
                                                            : !isAttended
                                                            ? 'Sertifikat tersedia setelah mengisi absen'
                                                            : !hasPostTest
                                                            ? 'Sertifikat tersedia setelah mengerjakan post-test'
                                                            : 'Sertifikat tersedia setelah mengisi monev'
                                                    }
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Award className="h-5 w-5 text-slate-300" />
                                                        {!isFinished
                                                            ? 'CETAK SERTIFIKAT (BELUM SELESAI)'
                                                            : !isAttended
                                                            ? 'CETAK SERTIFIKAT (ABSEN BELUM)'
                                                            : !hasPostTest
                                                            ? 'CETAK SERTIFIKAT (POST-TEST BELUM)'
                                                            : 'CETAK SERTIFIKAT (MONEV BELUM)'}
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    )
                                })()}

                                <p className="text-slate-400 font-bold text-[11px] tracking-widest uppercase text-center py-6">Tautan Penting & Sumberdaya</p>

                                {[
                                    { name: 'Akses Zoom Meeting', href: webinar.link_zoom, icon: VideoIcon, disabled: !webinar.link_zoom },
                                    { name: 'Link YouTube Webinar', href: webinar.link_youtube, icon: Youtube, disabled: !webinar.link_youtube },
                                    { name: 'Unduh Materi & PPT', href: webinar.link_materi, icon: FileText, disabled: !webinar.link_materi },
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
                            DILINDUNGI SISTEM SURAJAYA CORPU
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
