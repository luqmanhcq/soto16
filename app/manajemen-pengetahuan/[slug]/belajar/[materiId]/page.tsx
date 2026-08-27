'use client'

import React, { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Loader2, Video, FileText, ListVideo, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ManajemenPengetahuanBelajarPage({ params }: { params: Promise<{ slug: string; materiId: string }> }) {
    const { slug, materiId } = use(params)
    const { user } = useAuth()
    const [program, setProgram] = useState<any>(null)
    const [currentMateri, setCurrentMateri] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [completing, setCompleting] = useState(false)
    const [enrolled, setEnrolled] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/manajemen-pengetahuan/slug/${slug}`)
                if (res.ok) {
                    const data = await res.json()
                    setProgram(data.data)
                    setEnrolled(data.data.enrolled || false)
                    const materi = data.data.materials?.find((m: any) => m.id === parseInt(materiId))
                    if (materi) setCurrentMateri(materi)
                }
            } catch (error) {
                console.error('Failed to fetch belajar', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug, materiId])

    const handleMateriComplete = async () => {
        if (!currentMateri) return
        setCompleting(true)
        try {
            const res = await fetch(`/api/manajemen-pengetahuan/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manajemen_pengetahuan_id: program.id,
                    materi_id: currentMateri.id,
                    status: 'selesai'
                })
            })
            if (res.ok) {
                alert('Materi ditandai selesai!')
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

    const getVideoEmbedUrl = (url: string) => {
        if (!url) return ''
        if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/')
        if (url.includes('/embed/')) return url
        if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/')
        return url
    }

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

    const isLocked = !enrolled
    const currentIdx = program?.materials?.findIndex((m: any) => m.id === parseInt(materiId)) ?? 0
    const prevMateri = program?.materials?.[currentIdx - 1]
    const nextMateri = program?.materials?.[currentIdx + 1]

    if (loading) return <div className="p-20 text-center font-black text-indigo-600 animate-pulse">Memuat materi...</div>
    if (!program || !currentMateri) return <div className="p-20 text-center font-black text-red-500">Materi tidak ditemukan</div>
    if (isLocked) return (
        <div className="p-20 text-center space-y-6">
            <Lock className="h-16 w-16 text-slate-300 mx-auto" />
            <h2 className="text-2xl font-black text-slate-900">Materi Terkunci</h2>
            <p className="text-slate-500">Anda harus mendaftar program terlebih dahulu</p>
            <Link href={`/manajemen-pengetahuan/${slug}`} className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                <ArrowLeft className="h-5 w-5" /> Kembali
            </Link>
        </div>
    )

    const mTipe = currentMateri.tipe || 'video'
    const hasContent = mTipe === 'pdf' ? !!currentMateri.link_file : !!currentMateri.link_video

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href={`/manajemen-pengetahuan/${slug}`}
                            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Kembali
                        </Link>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-slate-900">{program.nama}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Materi Player */}
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                            {/* Video / Playlist embed */}
                            {mTipe !== 'pdf' && currentMateri.link_video && (
                                <div className="aspect-video w-full bg-slate-900 relative">
                                    <iframe
                                        src={getVideoEmbedUrl(currentMateri.link_video)}
                                        className="w-full h-full border-none"
                                        allowFullScreen
                                        title={currentMateri.nama}
                                    />
                                </div>
                            )}

                            {/* PDF embed */}
                            {mTipe === 'pdf' && currentMateri.link_file && (
                                <div className="w-full aspect-video min-h-[500px] bg-white">
                                    <iframe
                                        src={currentMateri.link_file}
                                        className="w-full h-full border-none"
                                        title={currentMateri.nama}
                                    />
                                </div>
                            )}

                            {/* Fallback for missing content */}
                            {!hasContent && (
                                <div className="aspect-video flex flex-col items-center justify-center bg-slate-50">
                                    {mTipe === 'pdf' ? (
                                        <FileText className="h-20 w-20 text-red-200 mb-4" />
                                    ) : (
                                        <Video className="h-20 w-20 text-indigo-200 mb-4" />
                                    )}
                                    <p className="text-xl font-bold text-slate-600 mb-2">
                                        {mTipe === 'pdf' ? 'File PDF belum tersedia' : 'Video belum tersedia'}
                                    </p>
                                </div>
                            )}

                            {/* Materi Info Bar */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${tipeBadge(mTipe)}`}>
                                        {tipeIcon(mTipe)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{currentMateri.nama}</h3>
                                        <p className="text-sm text-slate-500">Materi {currentIdx + 1} dari {program.materials?.length}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleMateriComplete}
                                    disabled={completing}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${completing ? 'bg-slate-300 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                >
                                    {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    {completing ? 'Menyimpan...' : 'TANDAI SELESAI'}
                                </button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <button
                                disabled={!prevMateri || isLocked}
                                className="inline-flex items-center gap-2 px-4 py-3 bg-white text-slate-700 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Materi Sebelumnya
                            </button>
                            <Link
                                href={prevMateri ? `/manajemen-pengetahuan/${slug}/belajar/${prevMateri.id}` : '#'}
                                className="inline-flex items-center gap-2 px-4 py-3 bg-white text-slate-700 rounded-xl font-bold border border-slate-200 hover:bg-slate-50"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Materi Sebelumnya
                            </Link>
                            <Link
                                href={nextMateri ? `/manajemen-pengetahuan/${slug}/belajar/${nextMateri.id}` : '#'}
                                className="inline-flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                            >
                                Materi Selanjutnya
                                <ChevronRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar - Materi List */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
                            <h4 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">Daftar Materi</h4>
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                                {program.materials?.map((materi: any, idx: number) => {
                                    const isCurrent = materi.id === parseInt(materiId)
                                    const mTipe = materi.tipe || 'video'
                                    return (
                                        <button
                                            key={materi.id}
                                            onClick={() => window.location.href = `/manajemen-pengetahuan/${slug}/belajar/${materi.id}`}
                                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${isCurrent ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className={`h-8 w-8 flex items-center justify-center rounded-lg font-black text-sm ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium truncate ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>{materi.nama}</p>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${tipeBadge(mTipe)}`}>
                                                    {tipeIcon(mTipe)}
                                                    {mTipe === 'playlist' ? 'PLAYLIST' : mTipe === 'pdf' ? 'PDF' : 'VIDEO'}
                                                </span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}