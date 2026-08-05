'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    ArrowLeft,
    CheckCircle2,
    Play,
    FileText,
    ChevronRight,
    Video,
    Menu,
    X,
    Circle,
    Home,
    CheckCircle,
    PlayCircle,
    Loader2,
    GraduationCap,
    ListVideo
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BelajarPage({ params }: { params: Promise<{ id: string; materiId: string }> }) {
    const { id, materiId } = use(params)
    const router = useRouter()
    const { user } = useAuth()
    const [course, setCourse] = useState<any>(null)
    const [materi, setMateri] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [completing, setCompleting] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const [courseRes, materiRes] = await Promise.all([
                    fetch(`/api/pembelajaran/${id}`),
                    fetch(`/api/pembelajaran/${id}/materi/${materiId}`)
                ])

                if (courseRes.ok && materiRes.ok) {
                    const courseData = await courseRes.json()
                    const materiData = await materiRes.json()
                    setCourse(courseData.data)
                    setMateri(materiData.data)
                }
            } catch (error) {
                console.error('Failed to fetch learning content', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id, materiId])

    const handleComplete = async () => {
        setCompleting(true)
        try {
            const res = await fetch(`/api/pembelajaran/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pembelajaran_id: parseInt(id),
                    materi_id: parseInt(materiId),
                    status: 'selesai'
                })
            })

            if (res.ok) {
                const currentIndex = course.materials.findIndex((m: any) => m.id === parseInt(materiId))
                const nextMateri = course.materials[currentIndex + 1]

                if (nextMateri) {
                    router.push(`/pembelajaran/${id}/belajar/${nextMateri.id}`)
                } else {
                    alert('Selamat! Anda telah menyelesaikan seluruh materi kursus ini.')
                    router.push(`/pembelajaran/${id}`)
                }
            }
        } catch (error) {
            console.error('Failed to complete materi', error)
        } finally {
            setCompleting(false)
        }
    }

    if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white animate-pulse">Menyiapkan Ruang Belajar...</div>
    if (!course || !materi) return <div className="p-20 text-center font-black text-red-500">Materi tidak ditemukan</div>

    const tipe = materi.tipe || 'video'

    const tipeBadge = (t: string) => {
        const map: Record<string, string> = {
            video: 'bg-blue-100 text-blue-700',
            pdf: 'bg-red-100 text-red-700',
            playlist: 'bg-purple-100 text-purple-700',
        }
        return map[t] || map.video
    }

    const tipeIcon = (t: string) => {
        switch (t) {
            case 'pdf': return <FileText className="h-3.5 w-3.5" />
            case 'playlist': return <ListVideo className="h-3.5 w-3.5" />
            default: return <Video className="h-3.5 w-3.5" />
        }
    }

    const getVideoEmbedUrl = (url: string) => {
        if (!url) return ''
        // YouTube watch URL
        if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/')
        // YouTube embed already
        if (url.includes('/embed/')) return url
        // YouTube short
        if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/')
        // Playlist or other embeddable URL
        return url
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-50 border-r border-slate-200 lg:static lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="flex flex-col h-full">
                    <header className="p-6 border-b border-slate-200">
                        <Link href={`/pembelajaran/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-4">
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </Link>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-[1.2]">{course.nama}</h2>
                    </header>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 mb-4 mt-2">Daftar Kurikulum</p>
                        {course.materials.map((m: any, idx: number) => {
                            const isCurrent = m.id === parseInt(materiId)
                            const mTipe = m.tipe || 'video'
                            return (
                                <Link
                                    key={m.id}
                                    href={`/pembelajaran/${id}/belajar/${m.id}`}
                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'}`}
                                >
                                    <div className={`h-8 w-8 flex items-center justify-center rounded-lg font-bold text-xs ${isCurrent ? 'bg-white/20' : 'bg-slate-100'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate line-clamp-1">{m.nama}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${isCurrent ? 'bg-white/20 text-white' : tipeBadge(mTipe)}`}>
                                                {tipeIcon(mTipe)}
                                                {mTipe === 'playlist' ? 'PLAYLIST' : mTipe === 'pdf' ? 'PDF' : 'VIDEO'}
                                            </span>
                                        </div>
                                    </div>
                                    {isCurrent && <PlayCircle className="h-4 w-4 flex-shrink-0" />}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                <header className="h-16 lg:h-20 flex items-center justify-between px-6 lg:px-10 border-b border-slate-100">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600">
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <GraduationCap className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold text-slate-700 hidden sm:inline">Kurikulum Terakreditasi Surajaya Corpu</span>
                    </div>
                    <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        TANDAI SELESAI
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-12">
                        {/* Content Area based on tipe */}
                        {tipe === 'video' && materi.link_video && (
                            <div className="aspect-video w-full rounded-[2.5rem] bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-100">
                                <iframe
                                    src={getVideoEmbedUrl(materi.link_video)}
                                    className="w-full h-full border-none"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {tipe === 'playlist' && materi.link_video && (
                            <div className="aspect-video w-full rounded-[2.5rem] bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-100">
                                <iframe
                                    src={getVideoEmbedUrl(materi.link_video)}
                                    className="w-full h-full border-none"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {tipe === 'pdf' && materi.link_file && (
                            <div className="w-full rounded-[2.5rem] bg-white shadow-2xl overflow-hidden ring-1 ring-slate-100">
                                <iframe
                                    src={materi.link_file}
                                    className="w-full h-[80vh] border-none"
                                    title={materi.nama}
                                />
                            </div>
                        )}

                        {/* Fallback for missing content */}
                        {tipe === 'video' && !materi.link_video && (
                            <div className="p-12 text-center bg-indigo-50 rounded-[2.5rem] border-2 border-dashed border-indigo-200">
                                <Video className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                                <p className="text-xl font-bold text-indigo-900">Video belum tersedia</p>
                            </div>
                        )}

                        {tipe === 'pdf' && !materi.link_file && (
                            <div className="p-12 text-center bg-red-50 rounded-[2.5rem] border-2 border-dashed border-red-200">
                                <FileText className="h-16 w-16 text-red-300 mx-auto mb-4" />
                                <p className="text-xl font-bold text-red-900">File PDF belum tersedia</p>
                                {materi.link_video && (
                                    <a href={materi.link_video} target="_blank" className="font-black text-red-600 underline mt-4 inline-block">Unduh File Materi</a>
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase ${tipeBadge(tipe)}`}>
                                    {tipeIcon(tipe)}
                                    {tipe === 'playlist' ? 'PLAYLIST' : tipe === 'pdf' ? 'PDF' : 'VIDEO'}
                                </span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{materi.nama}</h1>
                            <div className="h-1 w-20 bg-indigo-600 rounded-full" />
                            <p className="text-slate-500 font-medium py-4">Pastikan Anda membaca/menonton seluruh materi sebelum menandai modul ini sebagai selesai.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
