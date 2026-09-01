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
    UserCheck,
    Loader2,
    Youtube,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function WebinarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    
    const [webinar, setWebinar] = useState<any>(null)
    const [webinarLoading, setWebinarLoading] = useState(true)
    const [webinarError, setWebinarError] = useState<string | null>(null)
    const [isJoined, setIsJoined] = useState(false)
    const [isAttended, setIsAttended] = useState(false)
    const [hasPostTest, setHasPostTest] = useState(false)
    const [hasMonev, setHasMonev] = useState(false)
    const [attending, setAttending] = useState(false)
    const [joining, setJoining] = useState(false)

    const fetchWebinarData = useCallback(async () => {
        try {
            setWebinarLoading(true)
            setWebinarError(null)
            const res = await fetch(`/api/webinar/${id}`, { credentials: 'include' })
            if (!res.ok) throw new Error('Gagal mengambil data webinar')
            const result = await res.json()
            setWebinar(result.data)
            setIsJoined(result.data.isJoined || false)
            setIsAttended(result.data.isAttended || false)
            setHasPostTest(result.data.hasPostTest || false)
            setHasMonev(result.data.hasMonev || false)
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

    const handleAttendance = async () => {
        if (!user) { alert('Anda harus login terlebih dahulu'); return }
        setAttending(true)
        try {
            const res = await fetch(`/api/webinar/${id}/attendance`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
            if (!res.ok) throw new Error('Gagal mencatat absensi')
            await res.json()
            setIsAttended(true)
            alert('Absensi berhasil dicatat!')
        } catch (error) {
            console.error('Attendance error:', error)
            alert('Gagal melakukan absensi. Silakan coba lagi.')
        } finally { setAttending(false) }
    }

    const handleJoin = async () => {
        if (!user) { alert('Anda harus login terlebih dahulu'); router.push('/login'); return }
        setJoining(true)
        try {
            const res = await fetch(`/api/webinar/${id}/join`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
            const contentType = res.headers.get('content-type')
            if (!contentType?.includes('application/json')) throw new Error('Server error: Invalid response format')
            const result = await res.json()
            if (!res.ok) throw new Error(result?.message || 'Gagal mendaftar webinar')
            setIsJoined(true)
            alert('Berhasil mendaftar webinar!')
        } catch (error: any) {
            console.error('Join error:', error)
            alert(`Gagal mendaftar: ${error.message}`)
        } finally { setJoining(false) }
    }

    if (authLoading || webinarLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-500">Memuat detail webinar...</p>
                </div>
            </div>
        )
    }

    if (webinarError || !webinar) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 sm:p-10 text-center space-y-4">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                    <h1 className="text-lg sm:text-xl font-black text-slate-900">Webinar Tidak Ditemukan</h1>
                    <p className="text-sm text-slate-600">{webinarError || 'Webinar yang Anda cari tidak tersedia.'}</p>
                    <Link href="/webinar" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm">
                        <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
                    </Link>
                </div>
            </div>
        )
    }

    const now = new Date()
    const startDate = new Date(webinar.tanggal_mulai)
    const endDate = webinar.tanggal_selesai ? new Date(webinar.tanggal_selesai) : null
    const hasStarted = now >= startDate
    const hasEnded = endDate ? now > endDate : false
    const registrationClosed = endDate ? now > endDate : false

    return (
        <div className="w-full max-w-full min-w-0 overflow-x-hidden pb-20 lg:pb-0">
            {/* Top bar */}
            <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 w-full min-w-0">
                    <Link href="/webinar" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 shrink-0">
                        <span className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center"><ArrowLeft className="h-4 w-4" /></span>
                        <span className="hidden sm:inline">Katalog</span>
                    </Link>
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-black tracking-widest truncate max-w-[160px]">{webinar.kategori || 'UMUM'}</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black shrink-0"><Award className="h-3.5 w-3.5" /> {webinar.jumlah_jp || 0} JP</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0">
                <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3 items-start w-full min-w-0">
                    {/* Left */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0 w-full">
                        <header className="space-y-4 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-black tracking-widest">{webinar.kategori || 'UMUM'}</span>
                                <span className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black">{webinar.jumlah_jp || 0} JP</span>
                            </div>
                            <h1 className="text-[22px] sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight break-words">{webinar.nama_webinar}</h1>
                            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 font-bold text-slate-700 shadow-sm">
                                    <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                                    <span className="truncate">{new Date(webinar.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(webinar.tanggal_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 font-bold text-slate-700 shadow-sm">
                                    <Clock className="h-4 w-4 text-indigo-500 shrink-0" /> s/d {endDate ? new Date(webinar.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 font-bold text-slate-700 shadow-sm">
                                    <Users className="h-3.5 w-3.5 text-indigo-500 shrink-0" /> {webinar.kuota || 'Unlimited'} Peserta
                                </span>
                            </div>
                        </header>

                        <div className="aspect-video w-full rounded-2xl sm:rounded-3xl bg-slate-900 shadow-sm border border-slate-200 relative overflow-hidden group">
                            {webinar.gambar ? (
                                <Image src={webinar.gambar} alt={webinar.nama_webinar || 'Banner Webinar'} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" width={1200} height={675} loading="lazy" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                    <Play className="h-12 w-12 sm:h-16 sm:w-16 text-white/20" />
                                </div>
                            )}
                        </div>

                        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-5 sm:p-6 md:p-8 space-y-4 w-full min-w-0 overflow-hidden">
                            <h2 className="text-base sm:text-lg font-black text-slate-900 border-l-4 border-indigo-600 pl-3">Deskripsi Kegiatan</h2>
                            <div className="text-[13px] sm:text-sm md:text-base text-slate-600 leading-relaxed whitespace-pre-wrap break-words">{webinar.deskripsi}</div>
                        </section>

                        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-5 sm:p-6 md:p-8 space-y-5 w-full min-w-0 overflow-hidden">
                            <h2 className="text-base sm:text-lg font-black text-slate-900 border-l-4 border-indigo-600 pl-3">Narasumber & Panelis</h2>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
                                {(() => {
                                    try {
                                        const narasumber = JSON.parse(webinar.narasumber || '[]')
                                        if (Array.isArray(narasumber) && narasumber.length > 0) {
                                            return narasumber.map((nara: any, idx: number) => (
                                                <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-colors min-w-0">
                                                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm">{idx + 1}</div>
                                                    <h4 className="mt-3 text-[15px] font-black text-slate-900 leading-tight break-words">{nara.nama}</h4>
                                                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1 break-words">{nara.jabatan || 'Pembicara'}</p>
                                                    <p className="text-xs font-medium text-slate-500 mt-1 break-words">{nara.instansi || 'Surajaya Corpu'}</p>
                                                </div>
                                            ))
                                        }
                                        throw new Error('Not array')
                                    } catch (e) {
                                        const oldData = (webinar.narasumber || 'TBA') as string
                                        const narasList = oldData.includes('###') ? oldData.split('###') : oldData.split(', ')
                                        return narasList.map((nara: string, idx: number) => (
                                            <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl min-w-0">
                                                <h4 className="text-[15px] font-black text-slate-900 leading-tight break-words">{nara}</h4>
                                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1">Narasumber Utama</p>
                                            </div>
                                        ))
                                    }
                                })()}
                            </div>
                        </section>

                        <section className="bg-indigo-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white flex items-center gap-4 w-full min-w-0 overflow-hidden">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                                <Award className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-[11px] font-black uppercase tracking-widest opacity-80">Penyelenggara</h3>
                                <p className="text-base sm:text-lg font-black truncate">{webinar.penyelenggara || 'SURAJAYA CORPU'}</p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5 sm:space-y-6 lg:sticky lg:top-[72px] min-w-0 w-full">
                        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 w-full min-w-0 overflow-hidden">
                            <div className="text-center">
                                <p className="text-[11px] font-black tracking-widest uppercase text-slate-400">Poin Pengembangan</p>
                                <div className="flex items-baseline justify-center gap-1 mt-1">
                                    <span className="text-4xl sm:text-5xl font-black text-indigo-600 leading-none">{webinar.jumlah_jp || 2}</span>
                                    <span className="text-lg font-black text-slate-700">JP</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                {!isJoined ? (
                                    <div className="space-y-3">
                                        {registrationClosed && (
                                            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-center font-bold text-xs border border-red-200">
                                                Pendaftaran telah ditutup
                                            </div>
                                        )}
                                        <button
                                            onClick={handleJoin}
                                            disabled={joining || registrationClosed}
                                            className="w-full bg-indigo-600 text-white font-black text-sm py-4 rounded-xl sm:rounded-2xl shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {joining ? 'Mendaftar...' : registrationClosed ? 'PENDAFTARAN DITUTUP' : 'DAFTAR SEKARANG'}
                                        </button>
                                        <p className="text-center text-[11px] font-semibold text-slate-400">Gratis • Kuota {webinar.kuota || 'Unlimited'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-center font-black border border-emerald-200 text-xs tracking-widest">
                                            BERHASIL MENDAFTAR ✓
                                        </div>

                                        {!hasStarted && (
                                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 text-center font-bold text-xs border border-amber-200">Webinar belum dimulai</div>
                                        )}
                                        {hasStarted && !hasEnded && (
                                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 text-center font-bold text-xs border border-blue-200">Webinar sedang berlangsung</div>
                                        )}
                                        {hasEnded && (
                                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-center font-bold text-xs border border-emerald-200">Webinar telah selesai</div>
                                        )}

                                        <div className="grid gap-3">
                                            <Link
                                                href={hasEnded ? `/webinar/${id}/test?type=post_test` : '#'}
                                                className={`flex items-center justify-between p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${hasEnded ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}
                                                onClick={(e) => !hasEnded && e.preventDefault()}
                                            >
                                                <span className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> POST-TEST</span>
                                                {hasEnded && <ArrowRight className="h-4 w-4" />}
                                            </Link>
                                            <Link
                                                href={hasEnded ? `/webinar/${id}/test?type=monev` : '#'}
                                                className={`flex items-center justify-between p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${hasEnded ? 'bg-white border-2 border-indigo-100 text-indigo-600 hover:border-indigo-600' : 'bg-slate-100 border-2 border-slate-200 text-slate-400 cursor-not-allowed'}`}
                                                onClick={(e) => !hasEnded && e.preventDefault()}
                                            >
                                                <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> MONEV</span>
                                                {hasEnded && <ArrowRight className="h-4 w-4" />}
                                            </Link>
                                        </div>

                                        <div>
                                            {isAttended ? (
                                                <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-black text-xs uppercase">
                                                    <UserCheck className="h-4 w-4" /> ABSENSI BERHASIL
                                                </div>
                                            ) : hasStarted ? (
                                                <button onClick={handleAttendance} disabled={attending} className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50">
                                                    <span className="flex items-center gap-2">{attending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />} KLIK ABSENSI</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <div className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-100 text-slate-400 font-black text-xs uppercase border border-slate-200">
                                                    <UserCheck className="h-4 w-4" /> ABSENSI BELUM DIBUKA
                                                </div>
                                            )}
                                        </div>

                                        {(() => {
                                            const isFinished = hasEnded
                                            const isTimeElapsed = isFinished && endDate ? (now.getTime() - endDate.getTime()) >= 24 * 60 * 60 * 1000 : false
                                            const getNotReadyReason = () => {
                                                if (!webinar.template_sertifikat) return 'Template sertifikat belum diatur'
                                                if (!isJoined) return 'Anda belum mendaftar'
                                                if (!isFinished) return 'Webinar belum selesai'
                                                if (!isAttended) return 'Anda belum absen'
                                                if (!hasPostTest) return 'Belum mengerjakan post-test'
                                                if (!hasMonev) return 'Belum mengerjakan MONEV'
                                                if (!isTimeElapsed) return 'Sertifikat tersedia 1x24 jam setelah selesai'
                                                return null
                                            }
                                            const notReadyReason = getNotReadyReason()
                                            const canGetCert = !notReadyReason
                                            return (
                                                <div>
                                                    <button
                                                        onClick={() => {
                                                            const r = getNotReadyReason()
                                                            if (r) { alert(r); return }
                                                            router.push(`/webinar/${id}/sertifikat`)
                                                        }}
                                                        className={`w-full flex items-center justify-between p-4 rounded-xl font-black text-xs uppercase transition-all ${canGetCert ? 'bg-slate-900 text-white hover:bg-black shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}
                                                    >
                                                        <span className="flex items-center gap-2"><Award className="h-4 w-4" /> CETAK SERTIFIKAT</span>
                                                        {canGetCert && <ArrowRight className="h-4 w-4" />}
                                                    </button>
                                                    {!canGetCert && (
                                                        <p className="mt-2 text-center text-[11px] text-slate-500 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 leading-relaxed">{notReadyReason}</p>
                                                    )}
                                                </div>
                                            )
                                        })()}

                                        <div className="space-y-2 pt-2">
                                            <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 text-center">Tautan Penting</p>
                                            {[
                                                { name: 'Zoom Meeting', href: webinar.link_zoom, icon: VideoIcon },
                                                { name: 'YouTube Live', href: webinar.link_youtube, icon: Youtube },
                                                { name: 'Materi & PPT', href: webinar.link_materi, icon: FileText },
                                            ].map((link, idx) => (
                                                <a
                                                    key={idx}
                                                    href={link.href || undefined}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center justify-between p-3.5 rounded-xl font-bold text-sm border transition-all w-full min-w-0 ${!link.href ? 'bg-slate-50 text-slate-300 border-slate-100 pointer-events-none' : 'bg-white text-slate-700 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'}`}
                                                >
                                                    <span className="flex items-center gap-2.5 min-w-0"><link.icon className={`h-4 w-4 shrink-0 ${!link.href ? 'text-slate-300' : 'text-indigo-500'}`} /><span className="truncate">{link.name}</span></span>
                                                    {link.href && <ExternalLink className="h-3.5 w-3.5 opacity-40 shrink-0" />}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile bottom CTA */}
            {!isJoined && !registrationClosed && (
                <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-3">
                    <button onClick={handleJoin} disabled={joining} className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-black text-sm active:scale-[0.98] transition-all disabled:opacity-50">
                        {joining ? 'Mendaftar...' : 'DAFTAR WEBINAR SEKARANG'}
                    </button>
                </div>
            )}
        </div>
    )
}
