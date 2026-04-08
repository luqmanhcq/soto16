'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    ArrowLeft,
    Play,
    Clock,
    BarChart,
    Lock,
    CheckCircle2,
    FileText,
    PlaySquare,
    ChevronRight,
    GraduationCap
} from 'lucide-react'
import Link from 'next/link'

export default function PembelajaranDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user } = useAuth()
    const [course, setCourse] = useState<any>(null)
    const [progress, setProgress] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [courseRes, progressRes] = await Promise.all([
                    fetch(`/api/pembelajaran/${id}`),
                    fetch(`/api/dashboard/stats`) // Reuse or specific progress endpoint
                ])

                if (courseRes.ok) {
                    const res = await courseRes.json()
                    setCourse(res.data)
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
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black tracking-widest uppercase border border-indigo-100">
                            {course.kategori || 'UMUM'}
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">{course.nama_pembelajaran}</h1>
                        <p className="text-xl text-slate-500 leading-relaxed font-semibold">{course.deskripsi}</p>
                    </header>

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
                                                <p className="text-xs text-slate-400 uppercase tracking-widest">{materi.link_video ? 'Video Materi' : 'Bahan Bacaan'}</p>
                                            </div>
                                        </div>
                                        {firstMateriId && (
                                            <div className="h-5 w-5 text-slate-200">
                                                <Lock className="h-4 w-4" />
                                            </div>
                                        )}
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
                        <div className="mb-10 flex flex-col items-center">
                            <div className="h-20 w-20 rounded-3xl bg-indigo-500 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
                                <GraduationCap className="h-10 w-10" />
                            </div>
                            <h3 className="text-center text-xl font-bold mb-2">Program Sertifikasi SI-SOTO</h3>
                            <p className="text-center text-indigo-200 text-sm opacity-60">Selesaikan seluruh kurikulum untuk mendapatkan sertifikat kompetensi.</p>
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

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between text-sm py-3 border-b border-white/5">
                                <span className="text-indigo-200">Total Materi</span>
                                <span className="font-black text-white">{course.materials?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-3 border-b border-white/5">
                                <span className="text-indigo-200">Akses Mandiri</span>
                                <span className="font-black text-white uppercase">Selamanya</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-3">
                                <span className="text-indigo-200">Sertifikat</span>
                                <span className="font-black text-indigo-400 uppercase">Tersedia</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
