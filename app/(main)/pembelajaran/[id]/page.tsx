'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    ArrowLeft,
    Clock,
    Lock,
    CheckCircle2,
    FileText,
    ChevronDown,
    GraduationCap,
    ClipboardCheck,
    Award,
    Video,
    ListVideo,
    UserPlus,
    AlertCircle,
    ExternalLink,
    Loader2,
} from 'lucide-react'
import Link from 'next/link'

export default function PembelajaranDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user } = useAuth()
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [enrolled, setEnrolled] = useState(false)
    const [enrolling, setEnrolling] = useState(false)
    const [expandedMateriId, setExpandedMateriId] = useState<number | null>(null)
    const [completedMateriIds, setCompletedMateriIds] = useState<number[]>([])
    const [completing, setCompleting] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/pembelajaran/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setCourse(data.data)
                    setEnrolled(data.data.enrolled || false)
                    if (data.data.allMaterialsCompleted) {
                        setCompletedMateriIds((data.data.materials || []).map((m: any) => m.id))
                    }
                }
            } catch (error) {
                console.error('Failed to fetch detail', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleEnroll = async () => {
        if (!user) {
            alert('Silakan login terlebih dahulu')
            return
        }
        setEnrolling(true)
        try {
            const res = await fetch(`/api/pembelajaran/${id}/enroll`, { method: 'POST' })
            if (res.ok) {
                setEnrolled(true)
                setCourse((prev: any) => ({ ...prev, enrolled: true }))
                alert('Berhasil mendaftar kursus!')
            } else {
                const err = await res.json()
                alert(err.message || 'Gagal mendaftar')
            }
        } catch (error) {
            console.error('Enroll error', error)
            alert('Terjadi kesalahan')
        } finally {
            setEnrolling(false)
        }
    }

    const toggleMateri = (materiId: number) => {
        if (isLocked) return
        setExpandedMateriId(prev => (prev === materiId ? null : materiId))
    }

    const getVideoEmbedUrl = (url: string) => {
        if (!url) return ''
        if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/')
        if (url.includes('/embed/')) return url
        if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/')
        return url
    }

    const handleMateriComplete = async (materi: any) => {
        setCompleting(true)
        try {
            const res = await fetch(`/api/pembelajaran/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pembelajaran_id: parseInt(id),
                    materi_id: materi.id,
                    status: 'selesai'
                })
            })
            if (res.ok) {
                setCompletedMateriIds(prev => (prev.includes(materi.id) ? prev : [...prev, materi.id]))
                const detail = await fetch(`/api/pembelajaran/${id}`)
                if (detail.ok) {
                    const data = await detail.json()
                    setCourse(data.data)
                }
            } else {
                const err = await res.json()
                alert(err.message || 'Gagal menandai selesai')
            }
        } catch (error) {
            console.error('Failed to complete materi', error)
            alert('Terjadi kesalahan')
        } finally {
            setCompleting(false)
        }
    }

    const startLearning = () => {
        if (!firstMateriId || isLocked) return
        setExpandedMateriId(firstMateriId)
        setTimeout(() => {
            document.getElementById('kurikulum')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

    if (loading) return <div className="p-20 text-center font-black text-indigo-600 animate-pulse">Menyiapkan kurikulum...</div>
    if (!course) return <div className="p-20 text-center font-black text-red-500">Kursus tidak ditemukan</div>

    const firstMateriId = course.materials?.[0]?.id
    const isLocked = user && !enrolled

    // Completion checklist
    const checklist = [
        { key: 'enroll', label: 'Daftar Kursus', done: enrolled, href: null },
        { key: 'materials', label: 'Materi Pembelajaran', done: course.allMaterialsCompleted, href: firstMateriId ? `/pembelajaran/${id}/belajar/${firstMateriId}` : null },
        { key: 'pre_test', label: 'Pre-Test', done: course.hasPreTest, href: `/pembelajaran/${id}/test/pre_test` },
        { key: 'post_test', label: 'Post-Test', done: course.hasPostTest && course.postTestLulus, href: `/pembelajaran/${id}/test/post_test` },
        { key: 'monev', label: 'Evaluasi (Monev)', done: course.hasMonev, href: `/pembelajaran/${id}/test/monev` },
        { key: 'certificate', label: 'Sertifikat', done: false, href: `/pembelajaran/${id}/sertifikat` },
    ]

    const allDone = course.hasPreTest && course.hasPostTest && course.postTestLulus && course.hasMonev && course.allMaterialsCompleted

    const tipeIcon = (tipe: string) => {
        switch (tipe) {
            case 'pdf': return <FileText className="h-3.5 w-3.5" />
            case 'playlist': return <ListVideo className="h-3.5 w-3.5" />
            default: return <Video className="h-3.5 w-3.5" />
        }
    }

    const tipeBadge = (tipe: string) => {
        const map: Record<string, string> = {
            video: 'bg-blue-100 text-blue-700',
            pdf: 'bg-red-100 text-red-700',
            playlist: 'bg-purple-100 text-purple-700',
        }
        return map[tipe] || map.video
    }

    return (
        <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-12">
            <Link
                href="/pembelajaran"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all mb-4"
            >
                <ArrowLeft className="h-5 w-5" />
                Kembali ke Katalog
            </Link>

            <div className="grid gap-12 lg:grid-cols-3 items-start">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-12">
                    <header className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black tracking-widest uppercase border border-indigo-100">
                                {course.kategori || 'UMUM'}
                            </div>
                            {course.jumlah_jp && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-black tracking-widest uppercase border border-amber-100">
                                    <Clock className="h-3 w-3" /> {course.jumlah_jp} JP
                                </div>
                            )}
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">{course.nama}</h1>
                        <p className="text-xl text-slate-500 leading-relaxed font-semibold">{course.deskripsi}</p>

                        {/* Test duration info */}
                        {(course.pre_test_duration || course.post_test_duration) && (
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                {course.pre_test_duration && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                        <Clock className="h-3.5 w-3.5" />
                                        Pre-Test: {course.pre_test_duration} menit
                                    </span>
                                )}
                                {course.post_test_duration && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                        <Clock className="h-3.5 w-3.5" />
                                        Post-Test: {course.post_test_duration} menit
                                    </span>
                                )}
                            </div>
                        )}
                    </header>

                    {/* Materials List */}
                    <div id="kurikulum" className="space-y-6 bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 scroll-mt-24">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-4">Kurikulum Pembelajaran</h2>

                        {isLocked && (
                            <div className="mb-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-amber-800">Kursus Terkunci</p>
                                        <p className="text-sm text-amber-700">Anda harus mendaftar terlebih dahulu untuk mengakses materi pembelajaran, test, dan sertifikat.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {course.materials?.length > 0 ? (
                                course.materials.map((materi: any, idx: number) => {
                                    const isExpanded = expandedMateriId === materi.id
                                    const isCompleted = completedMateriIds.includes(materi.id)
                                    const mTipe = materi.tipe || 'video'
                                    const hasContent = mTipe === 'pdf' ? !!materi.link_file : !!materi.link_video
                                    return (
                                        <div
                                            key={materi.id}
                                            className={`border rounded-2xl overflow-hidden transition-all ${isExpanded ? 'border-indigo-200 shadow-lg shadow-indigo-50' : 'border-slate-100 hover:border-indigo-200'} ${isLocked ? 'opacity-60' : ''}`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleMateri(materi.id)}
                                                disabled={!!isLocked}
                                                className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 bg-white text-left transition-colors hover:bg-indigo-50/40 disabled:cursor-not-allowed disabled:hover:bg-white"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                                    <div className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl font-black text-sm shrink-0 transition-colors ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`font-bold text-sm sm:text-base truncate ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{materi.nama}</p>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${tipeBadge(mTipe)}`}>
                                                                {tipeIcon(mTipe)}
                                                                {mTipe === 'playlist' ? 'PLAYLIST' : mTipe === 'pdf' ? 'PDF' : 'VIDEO'}
                                                            </span>
                                                            {isCompleted && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-600">
                                                                    SELESAI
                                                                </span>
                                                            )}
                                                            {isLocked && <Lock className="h-3.5 w-3.5 text-slate-300" />}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`} />
                                            </button>

                                            {isExpanded && (
                                                <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-6 space-y-5">
                                                    {/* Video / Playlist embed */}
                                                    {mTipe !== 'pdf' && materi.link_video && (
                                                        <div className="aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden ring-1 ring-slate-200">
                                                            <iframe
                                                                src={getVideoEmbedUrl(materi.link_video)}
                                                                className="w-full h-full border-none"
                                                                allowFullScreen
                                                                title={materi.nama}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* PDF embed */}
                                                    {mTipe === 'pdf' && materi.link_file && (
                                                        <div className="w-full rounded-2xl bg-white overflow-hidden ring-1 ring-slate-200">
                                                            <iframe
                                                                src={materi.link_file}
                                                                className="w-full h-[55vh] sm:h-[70vh] border-none"
                                                                title={materi.nama}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Fallback for missing content */}
                                                    {!hasContent && (
                                                        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                                            {mTipe === 'pdf' ? (
                                                                <FileText className="h-14 w-14 text-red-200 mx-auto mb-3" />
                                                            ) : (
                                                                <Video className="h-14 w-14 text-indigo-200 mx-auto mb-3" />
                                                            )}
                                                            <p className="text-lg font-bold text-slate-600">
                                                                {mTipe === 'pdf' ? 'File PDF belum tersedia' : 'Video belum tersedia'}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Materi detail + actions */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <h3 className="text-base sm:text-lg font-black text-slate-900">{materi.nama}</h3>
                                                            <p className="text-xs sm:text-sm text-slate-500 font-medium">Materi {idx + 1} dari {course.materials.length}</p>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                            <Link
                                                                href={`/pembelajaran/${id}/belajar/${materi.id}`}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50 transition-all"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                                LAYAR PENUH
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMateriComplete(materi)}
                                                                disabled={completing || isCompleted}
                                                                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 disabled:opacity-50 ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                                            >
                                                                {completing ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : isCompleted ? (
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                )}
                                                                {isCompleted ? 'SELESAI' : 'TANDAI SELESAI'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="py-10 text-center text-slate-400 italic">Modul kurikulum sedang disusun.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Sidebar */}
                <div className="sticky top-12 space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white">
                        <div className="mb-8 flex flex-col items-center">
                            <div className="h-20 w-20 rounded-3xl bg-indigo-500 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
                                <GraduationCap className="h-10 w-10" />
                            </div>
                            <h3 className="text-center text-xl font-bold mb-2">Program Sertifikasi Surajaya Corpu</h3>
                            <p className="text-center text-indigo-200 text-sm opacity-60">Selesaikan seluruh kurikulum untuk mendapatkan sertifikat kompetensi.</p>
                        </div>

                        {/* Completion Checklist */}
                        <div className="space-y-3 mb-8">
                            {checklist.map(item => (
                                <div key={item.key} className="flex items-center gap-3">
                                    {item.done ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                                    ) : (
                                        <Lock className="h-5 w-5 text-slate-500 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm font-bold ${item.done ? 'text-white' : 'text-slate-500'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Enroll / Start Learning Button */}
                        {isLocked ? (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="block w-full bg-indigo-500 text-white text-center font-black text-lg py-5 rounded-2xl shadow-xl shadow-indigo-500/10 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-75 flex items-center justify-center gap-2"
                            >
                                {enrolling ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        Mendaftar...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5" />
                                        DAFTAR KURSUS
                                    </>
                                )}
                            </button>
                        ) : firstMateriId ? (
                            <button
                                onClick={startLearning}
                                className="block w-full bg-indigo-500 text-white text-center font-black text-lg py-5 rounded-2xl shadow-xl shadow-indigo-500/10 hover:bg-white hover:text-indigo-600 transition-all active:scale-95"
                            >
                                MULAI BELAJAR
                            </button>
                        ) : (
                            <button disabled className="w-full bg-slate-800 text-slate-500 font-black text-lg py-5 rounded-2xl border border-slate-700 cursor-not-allowed">
                                BELUM DIBUKA
                            </button>
                        )}

                        {/* Quick Navigation */}
                        <div className="mt-6 space-y-2">
                            <Link href={`/pembelajaran/${id}/test/pre_test`} className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${isLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : course.hasPreTest ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                <ClipboardCheck className="h-4 w-4 inline mr-2" />
                                Pre-Test {course.hasPreTest ? '✓' : isLocked ? '🔒' : ''}
                            </Link>
                            <Link href={`/pembelajaran/${id}/test/post_test`} className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${isLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : course.hasPostTest && course.postTestLulus ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                <ClipboardCheck className="h-4 w-4 inline mr-2" />
                                Post-Test {course.hasPostTest && course.postTestLulus ? '✓' : course.hasPostTest && !course.postTestLulus ? `(${course.postTestScore ?? 0}% < 50%)` : isLocked ? '🔒' : ''}
                            </Link>
                            <Link href={`/pembelajaran/${id}/test/monev`} className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${isLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : course.hasMonev ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                <ClipboardCheck className="h-4 w-4 inline mr-2" />
                                Evaluasi {course.hasMonev ? '✓' : isLocked ? '🔒' : ''}
                            </Link>
                            {allDone && !isLocked && (
                                <Link href={`/pembelajaran/${id}/sertifikat`} className="block w-full text-center py-3 rounded-xl font-bold text-sm bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all">
                                    <Award className="h-4 w-4 inline mr-2" />
                                    Unduh Sertifikat
                                </Link>
                            )}
                            {isLocked && (
                                <div className="block w-full text-center py-3 rounded-xl font-bold text-sm bg-slate-800 text-slate-500 cursor-not-allowed">
                                    <Award className="h-4 w-4 inline mr-2" />
                                    Sertifikat 🔒
                                </div>
                            )}
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between text-sm py-3 border-b border-white/5">
                                <span className="text-indigo-200">Total Materi</span>
                                <span className="font-black text-white">{course.materials?.length || 0}</span>
                            </div>
                            {course.jumlah_jp && (
                                <div className="flex items-center justify-between text-sm py-3 border-b border-white/5">
                                    <span className="text-indigo-200">Jam Pelajaran</span>
                                    <span className="font-black text-white">{course.jumlah_jp} JP</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm py-3">
                                <span className="text-indigo-200">Sertifikat</span>
                                <span className={`font-black uppercase ${allDone && !isLocked ? 'text-amber-400' : 'text-slate-500'}`}>
                                    {isLocked ? 'Kunci' : allDone ? 'Tersedia' : 'Terkunci'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}