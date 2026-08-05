'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    ArrowLeft,
    Play,
    Clock,
    Lock,
    CheckCircle2,
    FileText,
    PlaySquare,
    ChevronRight,
    GraduationCap,
    ClipboardCheck,
    Award,
    BookOpen,
    Video,
    ListVideo,
    ShieldCheck
} from 'lucide-react'
import Link from 'next/link'

export default function PembelajaranDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user } = useAuth()
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/pembelajaran/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setCourse(data.data)
                }
            } catch (error) {
                console.error('Failed to fetch detail', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) return <div className="p-20 text-center font-black text-indigo-600 animate-pulse">Menyiapkan kurikulum...</div>
    if (!course) return <div className="p-20 text-center font-black text-red-500">Kursus tidak ditemukan</div>

    const firstMateriId = course.materials?.[0]?.id

    // Completion checklist
    const checklist = [
        { key: 'materials', label: 'Materi Pembelajaran', done: course.allMaterialsCompleted, href: firstMateriId ? `/pembelajaran/${id}/belajar/${firstMateriId}` : null },
        { key: 'pre_test', label: 'Pre-Test', done: course.hasPreTest, href: `/pembelajaran/${id}/test/pre_test` },
        { key: 'post_test', label: 'Post-Test', done: course.hasPostTest, href: `/pembelajaran/${id}/test/post_test` },
        { key: 'monev', label: 'Evaluasi (Monev)', done: course.hasMonev, href: `/pembelajaran/${id}/test/monev` },
        { key: 'certificate', label: 'Sertifikat', done: false, href: `/pembelajaran/${id}/sertifikat` },
    ]

    const allDone = course.hasPreTest && course.hasPostTest && course.hasMonev && course.allMaterialsCompleted

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
                    </header>

                    {/* Materials List */}
                    <div className="space-y-8 bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-4">Kurikulum Pembelajaran</h2>
                        <div className="divide-y divide-slate-100">
                            {course.materials?.length > 0 ? (
                                course.materials.map((materi: any, idx: number) => (
                                    <div key={materi.id} className="py-5 flex items-center justify-between group">
                                        <div className="flex items-center gap-5">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 font-black transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{materi.nama}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${tipeBadge(materi.tipe || 'video')}`}>
                                                        {tipeIcon(materi.tipe || 'video')}
                                                        {materi.tipe === 'playlist' ? 'PLAYLIST' : materi.tipe === 'pdf' ? 'PDF' : 'VIDEO'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/pembelajaran/${id}/belajar/${materi.id}`}
                                            className="text-slate-300 hover:text-indigo-600 transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Link>
                                    </div>
                                ))
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

                        {firstMateriId ? (
                            <Link
                                href={`/pembelajaran/${id}/belajar/${firstMateriId}`}
                                className="block w-full bg-indigo-500 text-white text-center font-black text-lg py-5 rounded-2xl shadow-xl shadow-indigo-500/10 hover:bg-white hover:text-indigo-600 transition-all active:scale-95"
                            >
                                MULAI BELAJAR
                            </Link>
                        ) : (
                            <button disabled className="w-full bg-slate-800 text-slate-500 font-black text-lg py-5 rounded-2xl border border-slate-700 cursor-not-allowed">
                                BELUM DIBUKA
                            </button>
                        )}

                        {/* Quick Navigation */}
                        <div className="mt-6 space-y-2">
                            <Link href={`/pembelajaran/${id}/test/pre_test`} className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${course.hasPreTest ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                <ClipboardCheck className="h-4 w-4 inline mr-2" />
                                Pre-Test {course.hasPreTest ? '✓' : ''}
                            </Link>
                            <Link href={`/pembelajaran/${id}/test/post_test`} className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${course.hasPostTest ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                <ClipboardCheck className="h-4 w-4 inline mr-2" />
                                Post-Test {course.hasPostTest ? '✓' : ''}
                            </Link>
                            <Link href={`/pembelajaran/${id}/test/monev`} className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${course.hasMonev ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                <ClipboardCheck className="h-4 w-4 inline mr-2" />
                                Evaluasi {course.hasMonev ? '✓' : ''}
                            </Link>
                            {allDone && (
                                <Link href={`/pembelajaran/${id}/sertifikat`} className="block w-full text-center py-3 rounded-xl font-bold text-sm bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all">
                                    <Award className="h-4 w-4 inline mr-2" />
                                    Unduh Sertifikat
                                </Link>
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
                                <span className={`font-black uppercase ${allDone ? 'text-amber-400' : 'text-slate-500'}`}>{allDone ? 'Tersedia' : 'Terkunci'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
