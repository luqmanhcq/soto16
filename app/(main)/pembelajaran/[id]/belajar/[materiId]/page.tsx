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
    GraduationCap
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
                // Find next materi
                const currentIndex = course.materials.findIndex((m: any) => m.id === parseInt(materiId))
                const nextMateri = course.materials[currentIndex + 1]

                if (nextMateri) {
                    router.push(`/pembelajaran/${id}/belajar/${nextMateri.id}`)
                } else {
                    alert('Selamat! Anda telah menyelesaikan kursus ini.')
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

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-50 border-r border-slate-200 lg:static lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="flex flex-col h-full">
                    <header className="p-6 border-b border-slate-200">
                        <Link href={`/pembelajaran/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-4">
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </Link>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-[1.2]">{course.nama_pembelajaran}</h2>
                    </header>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 mb-4 mt-2">Daftar Kurikulum</p>
                        {course.materials.map((m: any, idx: number) => {
                            const isCurrent = m.id === parseInt(materiId)
                            return (
                                <Link
                                    key={m.id}
                                    href={`/pembelajaran/${id}/belajar/${m.id}`}
                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'}`}
                                >
                                    <div className={`h-8 w-8 flex items-center justify-center rounded-lg font-bold text-xs ${isCurrent ? 'bg-white/20' : 'bg-slate-100'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold truncate line-clamp-1">{m.nama}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            {m.link_video ? 'VIDEO' : 'DOKUMEN'}
                                        </p>
                                    </div>
                                    {isCurrent && <PlayCircle className="h-4 w-4" />}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                <header className="h-16 lg:h-20 flex items-center justify-between px-6 lg:px-10 border-b border-slate-100">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600">
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <GraduationCap className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold text-slate-700 hidden sm:inline">Kurikulum Terakreditasi SI-SOTO</span>
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
                        {materi.link_video ? (
                            <div className="aspect-video w-full rounded-[2.5rem] bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-100">
                                <iframe
                                    src={materi.link_video.replace('watch?v=', 'embed/')}
                                    className="w-full h-full border-none"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-indigo-50 rounded-[2.5rem] border-2 border-dashed border-indigo-200">
                                <FileText className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                                <p className="text-xl font-bold text-indigo-900">Materi Dokumen</p>
                                <p className="text-indigo-600 mb-6 font-medium">Bahan bacaan telah disematkan di bawah ini.</p>
                                {materi.link_file && (
                                    <a href={materi.link_file} target="_blank" className="font-black text-indigo-600 underline">Unduh File Materi</a>
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
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
