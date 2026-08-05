'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    Lock,
    Download,
    Loader2,
    FileText,
    GraduationCap,
    ClipboardCheck,
    BookOpen
} from 'lucide-react'
import Link from 'next/link'

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user } = useAuth()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/pembelajaran/${id}/certificate`)
                if (res.ok) {
                    const result = await res.json()
                    setData(result.data)
                }
            } catch (error) {
                console.error('Failed to fetch certificate data', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    async function handleDownload() {
        setDownloading(true)
        try {
            const res = await fetch(`/api/pembelajaran/${id}/certificate/pdf`)
            if (!res.ok) {
                const err = await res.json()
                alert(err.error || 'Gagal mengunduh sertifikat')
                return
            }
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `sertifikat-${data?.course?.nama || 'certificate'}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to download certificate', error)
            alert('Gagal mengunduh sertifikat')
        } finally {
            setDownloading(false)
        }
    }

    if (loading) return <div className="p-20 text-center font-black text-indigo-600 animate-pulse">Memeriksa kelengkapan...</div>

    if (!data) return (
        <div className="p-20 text-center space-y-4">
            <p className="font-black text-red-500 text-xl">Gagal memuat data sertifikat</p>
            <Link href={`/pembelajaran/${id}`} className="inline-flex items-center gap-2 text-indigo-600 font-bold">Kembali ke Kursus</Link>
        </div>
    )

    const { eligible, course, completion } = data

    const checklist = [
        { key: 'materials', label: 'Menyelesaikan Seluruh Materi', done: completion.allMaterialsCompleted, icon: BookOpen },
        { key: 'pre_test', label: 'Menyelesaikan Pre-Test', done: completion.hasPreTest, icon: ClipboardCheck },
        { key: 'post_test', label: 'Menyelesaikan Post-Test', done: completion.hasPostTest, icon: ClipboardCheck },
        { key: 'monev', label: 'Menyelesaikan Evaluasi (Monev)', done: completion.hasMonev, icon: ClipboardCheck },
    ]

    return (
        <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-10">
            <Link
                href={`/pembelajaran/${id}`}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all mb-4"
            >
                <ArrowLeft className="h-5 w-5" />
                Kembali ke Kursus
            </Link>

            {/* Header */}
            <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-100 text-center">
                <div className={`inline-flex p-6 rounded-3xl mb-6 ${eligible ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Award className="h-16 w-16" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                    {eligible ? 'Selamat! Sertifikat Tersedia' : 'Sertifikat Belum Tersedia'}
                </h1>
                <p className="text-xl text-slate-500 font-semibold max-w-lg mx-auto">
                    {eligible
                        ? `Anda telah menyelesaikan seluruh persyaratan untuk kursus "${course.nama}".`
                        : 'Selesaikan seluruh persyaratan berikut untuk mendapatkan sertifikat.'
                    }
                </p>

                {course.jumlah_jp && (
                    <p className="text-sm font-bold text-slate-400 mt-4">
                        Total: {course.jumlah_jp} Jam Pelajaran
                    </p>
                )}
            </div>

            {/* Checklist */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-4">Status Kelengkapan</h2>
                <div className="space-y-4">
                    {checklist.map(item => {
                        const Icon = item.icon
                        return (
                            <div key={item.key} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${item.done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                    {item.done ? <CheckCircle2 className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-bold ${item.done ? 'text-emerald-700' : 'text-slate-500'}`}>{item.label}</p>
                                </div>
                                <span className={`text-sm font-black uppercase tracking-widest ${item.done ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {item.done ? 'Selesai' : 'Belum'}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Download Button */}
            {eligible ? (
                <div className="text-center">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {downloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6" />}
                        UNDUH SERTIFIKAT PDF
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <Link
                        href={`/pembelajaran/${id}`}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all"
                    >
                        Kembali ke Kursus
                    </Link>
                </div>
            )}
        </div>
    )
}
