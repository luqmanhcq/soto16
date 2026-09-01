'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, FileText, Loader2, GraduationCap, CheckCircle2, Lock, Video, ListVideo, UserPlus, ChevronDown, ChevronUp, Play, ExternalLink, Award, Layers, ShieldCheck, Sparkles, BookOpen, Target } from 'lucide-react'

export default function ManajemenPengetahuanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [program, setProgram] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [enrolled, setEnrolled] = useState(false)
    const [enrolling, setEnrolling] = useState(false)
    const [expandedMateriId, setExpandedMateriId] = useState<number | null>(null)
    const [completedMateriIds, setCompletedMateriIds] = useState<number[]>([])
    const [completing, setCompleting] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/manajemen-pengetahuan/slug/${slug}`)
                if (res.ok) {
                    const data = await res.json()
                    setProgram(data.data)
                    setEnrolled(data.data.enrolled || false)
                    if (data.data.allMaterialsCompleted) {
                        setCompletedMateriIds((data.data.materials || []).map((m: any) => m.id))
                    } else if (data.data.progress) {
                        // try to derive from progress if provided
                        const done = (data.data.materials || []).filter((m: any) => m.completed).map((m: any) => m.id)
                        if (done.length) setCompletedMateriIds(done)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch detail', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug])

    const handleEnroll = async () => {
        if (!program) return
        setEnrolling(true)
        try {
            const res = await fetch(`/api/manajemen-pengetahuan/${program.id}/enroll`, { method: 'POST' })
            if (res.ok) {
                setEnrolled(true)
                setProgram((prev: any) => ({ ...prev, enrolled: true }))
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
            const res = await fetch(`/api/manajemen-pengetahuan/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manajemen_pengetahuan_id: program.id,
                    materi_id: materi.id,
                    status: 'selesai'
                })
            })
            if (res.ok) {
                setCompletedMateriIds(prev => (prev.includes(materi.id) ? prev : [...prev, materi.id]))
                const detail = await fetch(`/api/manajemen-pengetahuan/slug/${slug}`)
                if (detail.ok) {
                    const data = await detail.json()
                    setProgram(data.data)
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                    <div className="h-10 w-40 rounded-full bg-white border border-slate-200 animate-pulse" />
                    <div className="h-48 rounded-3xl bg-white border border-slate-200 animate-pulse" />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />
                        <div className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }
    if (!program) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-md w-full">
                    <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                        <FileText className="h-7 w-7" />
                    </div>
                    <h2 className="mt-4 text-lg font-black text-slate-900">Program tidak ditemukan</h2>
                    <p className="mt-1 text-sm text-slate-500">Periksa kembali tautan atau kembali ke katalog.</p>
                    <Link href="/manajemen-pengetahuan" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold">
                        <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
                    </Link>
                </div>
            </div>
        )
    }

    const firstMateriId = program.materials?.[0]?.id
    const isLocked = !enrolled
    const totalMateri = program.materials?.length || 0
    const completedCount = completedMateriIds.length
    const progressPct = totalMateri ? Math.round((completedCount / totalMateri) * 100) : 0
    const allMaterialsCompleted = program.allMaterialsCompleted || (totalMateri > 0 && completedCount === totalMateri)

    const tipeIcon = (tipe: string) => {
        switch (tipe) {
            case 'pdf': return <FileText className="h-3.5 w-3.5" />
            case 'playlist': return <ListVideo className="h-3.5 w-3.5" />
            default: return <Video className="h-3.5 w-3.5" />
        }
    }

    const tipeBadge = (tipe: string) => {
        const map: Record<string, string> = {
            video: 'bg-blue-50 text-blue-700 border-blue-100',
            pdf: 'bg-red-50 text-red-700 border-red-100',
            playlist: 'bg-purple-50 text-purple-700 border-purple-100',
        }
        return map[tipe] || map.video
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24 lg:pb-0">
            {/* Top bar */}
            <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
                    <Link href="/manajemen-pengetahuan" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors shrink-0">
                        <span className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                            <ArrowLeft className="h-4 w-4" />
                        </span>
                        <span className="hidden sm:inline">Katalog</span>
                    </Link>

                    {!isLocked && totalMateri > 0 && (
                        <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
                            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Target className="h-4 w-4 text-indigo-500" />
                                {completedCount}/{totalMateri}
                            </div>
                            <div className="flex-1 max-w-[180px] sm:max-w-[220px] h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 hidden sm:flex">
                                <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-widest border ${allMaterialsCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                                {progressPct}% • {allMaterialsCompleted ? 'SELESAI' : 'PROGRES'}
                            </span>
                        </div>
                    )}

                    {isLocked && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black">
                            <Lock className="h-3.5 w-3.5" /> TERKUNCI
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Hero */}
                <div className="grid gap-6 lg:gap-8 lg:grid-cols-3 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            {program.gambar && (
                                <div className="relative h-48 sm:h-64 lg:h-72 overflow-hidden bg-slate-100">
                                    <Image src={program.gambar} alt={program.nama} fill className="object-cover" sizes="(max-width:1024px) 100vw, 66vw" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-slate-900 text-xs font-black border border-white/20 shadow-sm">
                                            <Layers className="h-3.5 w-3.5 text-indigo-600" /> {program.kategori || 'UMUM'}
                                        </span>
                                        {program.jumlah_jp && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black shadow-sm">
                                                <Award className="h-3.5 w-3.5" /> {program.jumlah_jp} JP
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="p-5 sm:p-6 lg:p-8">
                                {!program.gambar && (
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-black tracking-widest">
                                            <Sparkles className="h-3.5 w-3.5" /> {program.kategori || 'UMUM'}
                                        </span>
                                        {program.jumlah_jp && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-black">
                                                <Clock className="h-3.5 w-3.5" /> {program.jumlah_jp} JP
                                            </span>
                                        )}
                                    </div>
                                )}

                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                                    {program.nama}
                                </h1>
                                <p className="mt-3 text-sm sm:text-base leading-relaxed font-medium text-slate-600">
                                    {program.deskripsi}
                                </p>

                                {/* meta stats */}
                                <div className="mt-6 grid grid-cols-3 gap-3">
                                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-center">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-500">Materi</p>
                                        <p className="mt-1 text-lg font-black text-slate-900">{totalMateri}</p>
                                    </div>
                                    <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3 text-center">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-indigo-600">Jam Pelajaran</p>
                                        <p className="mt-1 text-lg font-black text-indigo-700">{program.jumlah_jp || 0} JP</p>
                                    </div>
                                    <div className={`rounded-2xl border p-3 text-center ${allMaterialsCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                                        <p className={`text-[10px] font-black tracking-widest uppercase ${allMaterialsCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>Status</p>
                                        <p className={`mt-1 text-xs sm:text-sm font-black ${allMaterialsCompleted ? 'text-emerald-700' : 'text-slate-900'}`}>{allMaterialsCompleted ? 'Selesai' : `${progressPct}%`}</p>
                                    </div>
                                </div>

                                {/* Mobile progress */}
                                {!isLocked && totalMateri > 0 && (
                                    <div className="mt-6 sm:hidden rounded-2xl bg-slate-900 text-white p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black tracking-widest uppercase text-white/70">Progres Belajar</span>
                                            <span className="text-xs font-black">{completedCount}/{totalMateri}</span>
                                        </div>
                                        <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                                            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                                        </div>
                                    </div>
                                )}

                                {/* CTA inline for mobile */}
                                <div className="mt-6 flex gap-3 lg:hidden">
                                    {isLocked ? (
                                        <button onClick={handleEnroll} disabled={enrolling} className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60">
                                            {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                            {enrolling ? 'Mendaftar...' : 'Daftar Program'}
                                        </button>
                                    ) : (
                                        <button onClick={startLearning} className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black active:scale-[0.98] transition-all">
                                            <Play className="h-4 w-4 fill-white" /> Mulai Belajar
                                        </button>
                                    )}
                                    <Link href={`/manajemen-pengetahuan/${program.slug}`} className="hidden" />
                                </div>
                            </div>
                        </div>

                        {/* Kurikulum */}
                        <div id="kurikulum" className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden scroll-mt-20">
                            <div className="p-5 sm:p-6 lg:p-7 border-b border-slate-100 flex items-center justify-between gap-4">
                                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-3">
                                    <span className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                        <BookOpen className="h-4 w-4" />
                                    </span>
                                    Daftar Materi
                                    <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-600">{totalMateri} BAB</span>
                                </h2>
                                <span className="sm:hidden px-2.5 py-1 rounded-full bg-slate-100 text-xs font-black">{totalMateri} Materi</span>
                            </div>

                            {isLocked && (
                                <div className="mx-5 sm:mx-6 mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-amber-900">Program terkunci</p>
                                        <p className="text-xs font-medium text-amber-700 leading-relaxed">Daftar terlebih dahulu untuk membuka semua materi dan melacak progres.</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 sm:p-5 lg:p-6 space-y-3">
                                {program.materials?.length > 0 ? (
                                    program.materials.map((materi: any, idx: number) => {
                                        const isExpanded = expandedMateriId === materi.id
                                        const isCompleted = completedMateriIds.includes(materi.id)
                                        const mTipe = materi.tipe || 'video'
                                        const hasContent = mTipe === 'pdf' ? !!materi.link_file : !!materi.link_video
                                        return (
                                            <div
                                                key={materi.id}
                                                className={`rounded-2xl border overflow-hidden transition-all ${isExpanded ? 'border-indigo-200 shadow-md bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'} ${isLocked ? 'opacity-60' : ''}`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleMateri(materi.id)}
                                                    disabled={!!isLocked}
                                                    className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 text-left"
                                                >
                                                    <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-sm sm:text-[15px] font-bold leading-tight truncate ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>{materi.nama}</p>
                                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${tipeBadge(mTipe)}`}>
                                                                {tipeIcon(mTipe)}
                                                                {mTipe === 'playlist' ? 'Playlist' : mTipe === 'pdf' ? 'PDF' : 'Video'}
                                                            </span>
                                                            {isCompleted && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white">
                                                                    <CheckCircle2 className="h-3 w-3" /> Selesai
                                                                </span>
                                                            )}
                                                            {isLocked && <Lock className="h-3.5 w-3.5 text-slate-300" />}
                                                        </div>
                                                    </div>
                                                    <span className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${isExpanded ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </span>
                                                </button>

                                                {isExpanded && (
                                                    <div className="border-t border-slate-100 bg-white p-4 sm:p-5 space-y-4">
                                                        {/* Media */}
                                                        {mTipe !== 'pdf' && materi.link_video && (
                                                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 ring-1 ring-slate-900/5">
                                                                <iframe
                                                                    src={getVideoEmbedUrl(materi.link_video)}
                                                                    className="absolute inset-0 w-full h-full border-none"
                                                                    allowFullScreen
                                                                    title={materi.nama}
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                />
                                                            </div>
                                                        )}
                                                        {mTipe === 'pdf' && materi.link_file && (
                                                            <div className="w-full rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white">
                                                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                                                                    <span className="text-xs font-black tracking-widest uppercase text-slate-600 flex items-center gap-2"><FileText className="h-4 w-4 text-red-500" /> Dokumen PDF</span>
                                                                    <a href={materi.link_file} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1">Buka Tab Baru <ExternalLink className="h-3.5 w-3.5" /></a>
                                                                </div>
                                                                <iframe
                                                                    src={materi.link_file}
                                                                    className="w-full h-[58vh] sm:h-[62vh] border-none"
                                                                    title={materi.nama}
                                                                />
                                                            </div>
                                                        )}
                                                        {!hasContent && (
                                                            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                                                <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
                                                                    {mTipe === 'pdf' ? <FileText className="h-7 w-7" /> : <Video className="h-7 w-7" />}
                                                                </div>
                                                                <p className="mt-3 text-sm font-black text-slate-700">{mTipe === 'pdf' ? 'File PDF belum tersedia' : 'Video belum tersedia'}</p>
                                                                <p className="text-xs text-slate-500">Materi akan segera diperbarui.</p>
                                                            </div>
                                                        )}

                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <Link
                                                                href={`/manajemen-pengetahuan/${program.slug}/belajar/${materi.id}`}
                                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                Buka Layar Penuh
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMateriComplete(materi)}
                                                                disabled={completing || isCompleted}
                                                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98] disabled:opacity-50 ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                                            >
                                                                {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                                {isCompleted ? 'Selesai' : 'Tandai Selesai'}
                                                            </button>
                                                        </div>

                                                        <p className="text-center text-[11px] font-semibold text-slate-400">Materi {idx + 1} dari {totalMateri} • Selesaikan berurutan untuk hasil optimal</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                                        <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
                                        <p className="mt-3 text-sm font-black text-slate-600">Kurikulum sedang disusun</p>
                                        <p className="text-xs text-slate-500">Materi akan segera hadir.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 lg:sticky lg:top-[72px]">
                        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-7 relative overflow-hidden">
                            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl" />
                            <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" />
                            <div className="relative">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                                    <GraduationCap className="h-7 w-7" />
                                </div>
                                <h3 className="mt-5 text-xl font-black leading-tight">Manajemen Pengetahuan</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-300">Selesaikan semua materi untuk tuntas dan dapatkan JP sesuai program.</p>

                                <div className="mt-6 space-y-3">
                                    {isLocked ? (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-slate-900 font-black text-sm hover:bg-indigo-50 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg"
                                        >
                                            {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                            {enrolling ? 'Memproses...' : 'DAFTAR PROGRAM'}
                                        </button>
                                    ) : firstMateriId ? (
                                        <button
                                            onClick={startLearning}
                                            className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-500 text-white font-black text-sm hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
                                        >
                                            <Play className="h-4 w-4 fill-white" /> MULAI BELAJAR
                                        </button>
                                    ) : (
                                        <button disabled className="w-full py-4 rounded-2xl bg-white/10 text-white/50 font-black text-sm border border-white/10 cursor-not-allowed">
                                            BELUM TERSEDIA
                                        </button>
                                    )}
                                    <p className="text-center text-[11px] font-semibold text-white/60">
                                        {isLocked ? 'Gratis • Akses seumur hidup untuk ASN' : allMaterialsCompleted ? 'Selamat! Semua materi selesai' : `${completedCount}/${totalMateri} materi selesai`}
                                    </p>
                                </div>

                                <div className="mt-7 pt-6 border-t border-white/10 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-300 flex items-center gap-2"><Layers className="h-4 w-4" /> Total Materi</span>
                                        <span className="font-black">{totalMateri}</span>
                                    </div>
                                    {program.jumlah_jp && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-300 flex items-center gap-2"><Award className="h-4 w-4" /> Jam Pelajaran</span>
                                            <span className="font-black">{program.jumlah_jp} JP</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-300 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Status</span>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${allMaterialsCompleted ? 'bg-emerald-500 text-white' : isLocked ? 'bg-amber-500 text-slate-900' : 'bg-white/15 text-white'}`}>
                                            {allMaterialsCompleted ? 'SELESAI' : isLocked ? 'TERKUNCI' : 'BELAJAR'}
                                        </span>
                                    </div>
                                    {!isLocked && (
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-white/60">Progress</span>
                                                <span className="text-xs font-black">{progressPct}%</span>
                                            </div>
                                            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
                            <h4 className="text-xs font-black tracking-widest uppercase text-slate-500 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-indigo-600" /> Tips Belajar
                            </h4>
                            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                                <li className="flex gap-3">
                                    <span className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0">1</span>
                                    <span className="text-slate-600"><span className="font-bold text-slate-900">Tonton berurutan</span> agar pemahaman runtut.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black shrink-0">2</span>
                                    <span className="text-slate-600"><span className="font-bold text-slate-900">Tandai selesai</span> tiap materi untuk update progres.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="h-6 w-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-black shrink-0">3</span>
                                    <span className="text-slate-600"><span className="font-bold text-slate-900">Buka layar penuh</span> untuk fokus maksimal di HP.</span>
                                </li>
                            </ul>
                            <Link href="/manajemen-pengetahuan" className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black">
                                Jelajahi Program Lain <ArrowLeft className="h-4 w-4 rotate-180" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile bottom CTA */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-3 safe-area-pb">
                <div className="max-w-7xl mx-auto flex gap-3">
                    {isLocked ? (
                        <button onClick={handleEnroll} disabled={enrolling} className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-sm active:scale-[0.98] transition-all disabled:opacity-60">
                            {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                            {enrolling ? 'Mendaftar...' : 'Daftar & Mulai'}
                        </button>
                    ) : (
                        <>
                            <Link href={firstMateriId ? `/manajemen-pengetahuan/${program.slug}/belajar/${firstMateriId}` : '#'} className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 text-white font-black text-sm active:scale-[0.98] transition-all">
                                <Play className="h-4 w-4 fill-white" /> Lanjut Belajar
                            </Link>
                            {!allMaterialsCompleted && completedCount > 0 && (
                                <span className="inline-flex items-center px-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black">
                                    {progressPct}%
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
