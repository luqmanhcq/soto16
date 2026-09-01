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
        if (!user) { alert('Silakan login terlebih dahulu'); return }
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
        } finally { setEnrolling(false) }
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
                body: JSON.stringify({ pembelajaran_id: parseInt(id), materi_id: materi.id, status: 'selesai' })
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
        } finally { setCompleting(false) }
    }

    const startLearning = () => {
        if (!firstMateriId || isLocked) return
        setExpandedMateriId(firstMateriId)
        setTimeout(() => { document.getElementById('kurikulum')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100)
    }

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                <p className="text-sm font-bold text-slate-500">Menyiapkan kurikulum...</p>
            </div>
        </div>
    )
    if (!course) return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <p className="font-black text-red-600">Kursus tidak ditemukan</p>
                <Link href="/pembelajaran" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
            </div>
        </div>
    )

    const firstMateriId = course.materials?.[0]?.id
    const isLocked = user && !enrolled
    const totalMateri = course.materials?.length || 0
    const completedCount = completedMateriIds.length
    const progressPct = totalMateri ? Math.round((completedCount / totalMateri) * 100) : 0

    const checklist = [
        { key: 'enroll', label: 'Daftar Kursus', done: enrolled },
        { key: 'materials', label: 'Materi Pembelajaran', done: course.allMaterialsCompleted },
        { key: 'pre_test', label: 'Pre-Test', done: course.hasPreTest },
        { key: 'post_test', label: 'Post-Test', done: course.hasPostTest && course.postTestLulus },
        { key: 'monev', label: 'Evaluasi (Monev)', done: course.hasMonev },
        { key: 'certificate', label: 'Sertifikat', done: false },
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
        const map: Record<string, string> = { video: 'bg-blue-50 text-blue-700 border-blue-100', pdf: 'bg-red-50 text-red-700 border-red-100', playlist: 'bg-purple-50 text-purple-700 border-purple-100' }
        return map[tipe] || map.video
    }

    return (
        <div className="w-full max-w-full min-w-0 overflow-x-hidden pb-20 lg:pb-0">
            <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 w-full min-w-0">
                    <Link href="/pembelajaran" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 shrink-0">
                        <span className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center"><ArrowLeft className="h-4 w-4" /></span>
                        <span className="hidden sm:inline">Katalog</span>
                    </Link>
                    <div className="flex items-center gap-2 min-w-0">
                        {!isLocked && totalMateri > 0 && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black">{completedCount}/{totalMateri} • {progressPct}%</span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-black truncate max-w-[120px] sm:max-w-none">{course.kategori || 'UMUM'}</span>
                        {course.jumlah_jp && <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black shrink-0"><Clock className="h-3.5 w-3.5" /> {course.jumlah_jp} JP</span>}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0">
                <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3 items-start w-full min-w-0">
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0 w-full">
                        <header className="space-y-4 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-black tracking-widest">{course.kategori || 'UMUM'}</span>
                                {course.jumlah_jp && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-black"><Clock className="h-3.5 w-3.5" /> {course.jumlah_jp} JP</span>}
                            </div>
                            <h1 className="text-[22px] sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight break-words">{course.nama}</h1>
                            <p className="text-[13px] sm:text-sm md:text-base text-slate-600 leading-relaxed font-medium break-words">{course.deskripsi}</p>
                            {(course.pre_test_duration || course.post_test_duration) && (
                                <div className="flex flex-wrap gap-2">
                                    {course.pre_test_duration && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold"><Clock className="h-3.5 w-3.5" /> Pre-Test: {course.pre_test_duration} menit</span>}
                                    {course.post_test_duration && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold"><Clock className="h-3.5 w-3.5" /> Post-Test: {course.post_test_duration} menit</span>}
                                </div>
                            )}
                            {!isLocked && totalMateri > 0 && (
                                <div className="sm:hidden flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                                        <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                                    </div>
                                    <span className="text-xs font-black text-indigo-600 shrink-0">{progressPct}%</span>
                                </div>
                            )}
                        </header>

                        <div id="kurikulum" className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden scroll-mt-20 w-full min-w-0">
                            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
                                <h2 className="text-[15px] sm:text-lg font-black text-slate-900 flex items-center gap-2.5">
                                    <span className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0"><GraduationCap className="h-4 w-4" /></span>
                                    Kurikulum Pembelajaran
                                    <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-600">{totalMateri} BAB</span>
                                </h2>
                                <span className="sm:hidden px-2.5 py-1 rounded-full bg-slate-100 text-xs font-black shrink-0">{totalMateri} Materi</span>
                            </div>

                            {isLocked && (
                                <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-amber-900">Kursus Terkunci</p>
                                        <p className="text-xs font-medium text-amber-700 leading-relaxed">Daftar terlebih dahulu untuk membuka materi, test, dan sertifikat.</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-3 sm:p-5 space-y-3 w-full min-w-0">
                                {course.materials?.length > 0 ? (
                                    course.materials.map((materi: any, idx: number) => {
                                        const isExpanded = expandedMateriId === materi.id
                                        const isCompleted = completedMateriIds.includes(materi.id)
                                        const mTipe = materi.tipe || 'video'
                                        const hasContent = mTipe === 'pdf' ? !!materi.link_file : !!materi.link_video
                                        return (
                                            <div key={materi.id} className={`rounded-2xl border overflow-hidden transition-all w-full min-w-0 ${isExpanded ? 'border-indigo-200 shadow-md bg-indigo-50/20' : 'border-slate-100 bg-white hover:border-slate-200'} ${isLocked ? 'opacity-60' : ''}`}>
                                                <button type="button" onClick={() => toggleMateri(materi.id)} disabled={!!isLocked} className="w-full flex items-center gap-3 p-3 sm:p-4 text-left min-w-0">
                                                    <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-sm font-bold leading-tight truncate ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>{materi.nama}</p>
                                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${tipeBadge(mTipe)}`}>{tipeIcon(mTipe)} {mTipe === 'playlist' ? 'PLAYLIST' : mTipe === 'pdf' ? 'PDF' : 'VIDEO'}</span>
                                                            {isCompleted && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white"><CheckCircle2 className="h-3 w-3" /> Selesai</span>}
                                                            {isLocked && <Lock className="h-3.5 w-3.5 text-slate-300" />}
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`} />
                                                </button>

                                                {isExpanded && (
                                                    <div className="border-t border-slate-100 bg-white p-3 sm:p-5 space-y-4 w-full min-w-0 overflow-hidden">
                                                        {mTipe !== 'pdf' && materi.link_video && (
                                                            <div className="aspect-video w-full rounded-xl sm:rounded-2xl bg-slate-900 overflow-hidden border border-slate-200">
                                                                <iframe src={getVideoEmbedUrl(materi.link_video)} className="w-full h-full border-none" allowFullScreen title={materi.nama} />
                                                            </div>
                                                        )}
                                                        {mTipe === 'pdf' && materi.link_file && (
                                                            <div className="w-full rounded-xl bg-white overflow-hidden border border-slate-200">
                                                                <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-slate-50 border-b border-slate-200 gap-2">
                                                                    <span className="text-xs font-black uppercase text-slate-600 flex items-center gap-1.5"><FileText className="h-4 w-4 text-red-500 shrink-0" /> PDF</span>
                                                                    <a href={materi.link_file} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-indigo-600 flex items-center gap-1 shrink-0">Buka Tab <ExternalLink className="h-3 w-3" /></a>
                                                                </div>
                                                                <iframe src={materi.link_file} className="w-full h-[50vh] sm:h-[60vh] border-none" title={materi.nama} />
                                                            </div>
                                                        )}
                                                        {!hasContent && (
                                                            <div className="p-6 sm:p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                                <p className="text-sm font-bold text-slate-600">{mTipe === 'pdf' ? 'File PDF belum tersedia' : 'Video belum tersedia'}</p>
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col sm:flex-row gap-2.5">
                                                            <Link href={`/pembelajaran/${id}/belajar/${materi.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs bg-white text-indigo-600 border border-slate-200 hover:bg-slate-50">
                                                                <ExternalLink className="h-4 w-4" /> LAYAR PENUH
                                                            </Link>
                                                            <button type="button" onClick={() => handleMateriComplete(materi)} disabled={completing || isCompleted} className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-black text-xs transition-all active:scale-[0.98] disabled:opacity-50 ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                                                {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                                {isCompleted ? 'SELESAI' : 'TANDAI SELESAI'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="py-8 text-center text-sm text-slate-400">Modul kurikulum sedang disusun.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 sm:space-y-6 lg:sticky lg:top-[72px] min-w-0 w-full">
                        <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden w-full min-w-0">
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
                            <div className="relative">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg"><GraduationCap className="h-6 w-6" /></div>
                                <h3 className="mt-4 text-lg font-black leading-tight">Program Sertifikasi Surajaya Corpu</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-300">Selesaikan seluruh kurikulum untuk mendapatkan sertifikat kompetensi.</p>

                                <div className="mt-5 space-y-2">
                                    {checklist.map(item => (
                                        <div key={item.key} className="flex items-center gap-2.5">
                                            {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : <Lock className="h-4 w-4 text-slate-500 shrink-0" />}
                                            <span className={`text-[13px] font-bold truncate ${item.done ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    {isLocked ? (
                                        <button onClick={handleEnroll} disabled={enrolling} className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50">
                                            {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                            {enrolling ? 'Mendaftar...' : 'DAFTAR KURSUS'}
                                        </button>
                                    ) : firstMateriId ? (
                                        <button onClick={startLearning} className="w-full py-4 rounded-xl bg-white text-slate-900 font-black text-sm hover:bg-indigo-50 active:scale-[0.98]">MULAI BELAJAR</button>
                                    ) : (
                                        <button disabled className="w-full py-4 rounded-xl bg-white/10 text-white/50 font-black text-sm border border-white/10 cursor-not-allowed">BELUM DIBUKA</button>
                                    )}
                                </div>

                                <div className="mt-5 grid gap-2">
                                    <Link href={`/pembelajaran/${id}/test/pre_test`} className={`block w-full text-center py-3 rounded-xl font-bold text-xs transition-colors ${isLocked ? 'bg-white/10 text-white/40 cursor-not-allowed' : course.hasPreTest ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-white/10 text-white hover:bg-white/15'}`}>Pre-Test {course.hasPreTest ? '✓' : isLocked ? '🔒' : ''}</Link>
                                    <Link href={`/pembelajaran/${id}/test/post_test`} className={`block w-full text-center py-3 rounded-xl font-bold text-xs transition-colors ${isLocked ? 'bg-white/10 text-white/40 cursor-not-allowed' : course.hasPostTest && course.postTestLulus ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-white/10 text-white hover:bg-white/15'}`}>Post-Test {course.hasPostTest && course.postTestLulus ? '✓' : course.hasPostTest && !course.postTestLulus ? `(${course.postTestScore ?? 0}%)` : isLocked ? '🔒' : ''}</Link>
                                    <Link href={`/pembelajaran/${id}/test/monev`} className={`block w-full text-center py-3 rounded-xl font-bold text-xs transition-colors ${isLocked ? 'bg-white/10 text-white/40 cursor-not-allowed' : course.hasMonev ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-white/10 text-white hover:bg-white/15'}`}>Evaluasi {course.hasMonev ? '✓' : isLocked ? '🔒' : ''}</Link>
                                    {allDone && !isLocked ? (
                                        <Link href={`/pembelajaran/${id}/sertifikat`} className="block w-full text-center py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-900 hover:bg-amber-400"><Award className="h-4 w-4 inline mr-1" /> Unduh Sertifikat</Link>
                                    ) : isLocked ? (
                                        <div className="block w-full text-center py-3 rounded-xl font-bold text-xs bg-white/5 text-white/30">Sertifikat 🔒</div>
                                    ) : null}
                                </div>

                                <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5 text-sm">
                                    <div className="flex items-center justify-between"><span className="text-slate-400">Total Materi</span><span className="font-black">{totalMateri}</span></div>
                                    {course.jumlah_jp && <div className="flex items-center justify-between"><span className="text-slate-400">Jam Pelajaran</span><span className="font-black">{course.jumlah_jp} JP</span></div>}
                                    <div className="flex items-center justify-between"><span className="text-slate-400">Sertifikat</span><span className={`font-black uppercase text-xs px-2.5 py-1 rounded-full ${allDone && !isLocked ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50'}`}>{isLocked ? 'Kunci' : allDone ? 'Tersedia' : 'Terkunci'}</span></div>
                                    {!isLocked && totalMateri > 0 && (
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between mb-1.5"><span className="text-xs text-white/60">Progress</span><span className="text-xs font-black">{progressPct}%</span></div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} /></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-3">
                {isLocked ? (
                    <button onClick={handleEnroll} disabled={enrolling} className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-black text-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                        {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} {enrolling ? 'Mendaftar...' : 'Daftar Kursus'}
                    </button>
                ) : (
                    <button onClick={startLearning} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-black text-sm active:scale-[0.98] flex items-center justify-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Mulai Belajar
                    </button>
                )}
            </div>
        </div>
    )
}
