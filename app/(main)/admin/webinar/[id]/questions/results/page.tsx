'use client'

import React, { useState, useEffect, use } from 'react'
import {
    ChevronLeft,
    BarChart3,
    Users,
    CheckCircle2,
    XCircle,
    Loader2,
    Download,
    ClipboardCheck,
    MessageSquare,
    PieChart,
    LayoutList,
    Search,
    FileSpreadsheet
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import * as XLSX from 'xlsx'

export default function WebinarResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const webinarId = parseInt(id)
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialType = (searchParams.get('type') as 'post_test' | 'monev') || 'post_test'
    
    const [activeTab, setActiveTab] = useState<'post_test' | 'monev'>(initialType)
    const [results, setResults] = useState<any[]>([])
    const [respondents, setRespondents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [webinar, setWebinar] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        fetchData()
    }, [user, activeTab])

    async function fetchData() {
        setLoading(true)
        try {
            const webRes = await fetch(`/api/webinar/${webinarId}`)
            const webData = await webRes.json()
            if (webRes.ok) setWebinar(webData.data)

            const res = await fetch(`/api/webinar/${webinarId}/questions/results?type=${activeTab}`)
            const data = await res.json()
            if (res.ok) {
                setResults(data.data.results || [])
                setRespondents(data.data.respondents || [])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const filteredRespondents = respondents.filter(r => 
        r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nip.includes(searchTerm) ||
        r.unit_kerja?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const exportToExcel = () => {
        const dataToExport = filteredRespondents.map((r, index) => ({
            'No': index + 1,
            'NIP': r.nip,
            'Nama': r.nama,
            'Nilai': activeTab === 'post_test' ? r.score : '-',
            'Jabatan': r.jabatan || '-',
            'OPD/Unit Kerja': r.unit_kerja || '-',
            'Waktu Submit': new Date(r.submitted_at).toLocaleString('id-ID')
        }))

        const worksheet = XLSX.utils.json_to_sheet(dataToExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Responden')
        
        const fileName = `Hasil_${activeTab === 'post_test' ? 'PostTest' : 'Monev'}_${webinar?.nama_webinar || 'Webinar'}.xlsx`
        XLSX.writeFile(workbook, fileName)
    }

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Link
                        href={`/admin/webinar/${webinarId}/questions?type=${activeTab}`}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-all text-xs uppercase tracking-widest"
                    >
                        <ChevronLeft className="h-4 w-4" /> Kembali ke Manajemen Soal
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Analitik <span className="text-indigo-600">Hasil.</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">
                        Webinar: {webinar?.nama_webinar || 'Loading...'}
                    </p>
                </div>
                <button 
                    onClick={exportToExcel}
                    disabled={respondents.length === 0}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
                >
                    <FileSpreadsheet className="h-5 w-5" /> EXPORT EXCEL
                </button>
            </header>

            <div className="flex gap-4 border-b border-slate-100 p-2 bg-slate-50 rounded-[2rem]">
                <button
                    onClick={() => setActiveTab('post_test')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'post_test' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <ClipboardCheck className="h-4 w-4" /> Hasil Post-Test
                </button>
                <button
                    onClick={() => setActiveTab('monev')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'monev' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <MessageSquare className="h-4 w-4" /> Hasil Monev
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Menganalisis Data...</p>
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-16">
                    {/* STATS SECTION */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-xl shadow-indigo-100 flex flex-col items-center justify-center text-center">
                            <Users className="h-10 w-10 mb-6 opacity-50" />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Responden</p>
                            <p className="text-5xl font-black italic tracking-tighter mt-1">{respondents.length}</p>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-50 flex flex-col items-center justify-center text-center">
                            <BarChart3 className="h-10 w-10 mb-6 text-indigo-600 opacity-50" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rata-rata Nilai</p>
                            <p className="text-5xl font-black text-slate-900 italic tracking-tighter mt-1">
                                {activeTab === 'post_test' && respondents.length > 0 
                                    ? Math.round(respondents.reduce((acc, curr) => acc + curr.score, 0) / respondents.length)
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* RESPONDENT LIST SECTION */}
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
                                <Users className="h-6 w-6 text-indigo-600" /> Daftar Nama Responden
                            </h2>
                            <div className="relative max-w-md w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <input 
                                    type="text" 
                                    placeholder="Cari NIP, Nama, atau OPD..."
                                    className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl font-bold text-xs uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">No</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">NIP</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Nama Lengkap</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Nilai</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Jabatan</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">OPD/Unit Kerja</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRespondents.map((r, index) => (
                                        <tr key={r.id} className="group hover:bg-slate-50/30 transition-all border-b border-slate-50 last:border-0">
                                            <td className="px-8 py-6 text-sm font-black text-slate-300 italic">{(index + 1).toString().padStart(2, '0')}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-600 font-mono tracking-tight">{r.nip}</td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{r.nama}</p>
                                                <p className="text-[10px] font-bold text-slate-400 italic mt-1">Submitted: {new Date(r.submitted_at).toLocaleString('id-ID')}</p>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {activeTab === 'post_test' ? (
                                                    <span className={`inline-flex px-4 py-2 rounded-xl font-black text-lg ${r.score >= (webinar?.nilai_min || 70) ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                                        {r.score}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 font-black">-</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-500 max-w-[200px] truncate">{r.jabatan || '-'}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {r.unit_kerja || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRespondents.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center">
                                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Tidak ada data responden yang ditemukan</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* DETAIL PER QUESTION SECTION */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
                            <LayoutList className="h-6 w-6 text-indigo-600" /> Analisis Pilihan Jawaban
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            {results.map((q, idx) => (
                                <div key={idx} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden flex flex-col">
                                    <div className="p-10 flex-1 space-y-8">
                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-lg">Pertanyaan {idx + 1}</span>
                                            <h3 className="text-xl font-black text-slate-900 italic leading-snug tracking-tight line-clamp-3">{q.question_text}</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {q.options.map((opt: any, oIdx: number) => {
                                                const percentage = q.totalAnswers > 0 ? Math.round((opt.count / q.totalAnswers) * 100) : 0
                                                return (
                                                    <div key={oIdx} className="space-y-2">
                                                        <div className="flex justify-between items-center px-2">
                                                            <span className={`text-[11px] font-bold flex items-center gap-2 ${opt.is_correct && activeTab === 'post_test' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                                {opt.option_text}
                                                                {opt.is_correct && activeTab === 'post_test' && <CheckCircle2 className="h-3 w-3" />}
                                                            </span>
                                                            <span className="text-[11px] font-black text-slate-900">{opt.count}</span>
                                                        </div>
                                                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                            <div 
                                                                className={`h-full transition-all duration-1000 ${opt.is_correct && activeTab === 'post_test' ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Respons: {q.totalAnswers}</p>
                                        <BarChart3 className="h-4 w-4 text-slate-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 rounded-[4rem] p-40 text-center space-y-6 border-4 border-dashed border-slate-100">
                    <XCircle className="h-20 w-20 text-slate-200 mx-auto" />
                    <h3 className="text-3xl font-black text-slate-300 uppercase italic tracking-tighter">Data Belum Tersedia</h3>
                    <p className="text-slate-400 font-bold italic">Belum ada peserta yang mengumpulkan {activeTab === 'post_test' ? 'Post-test' : 'Monev'} untuk webinar ini.</p>
                </div>
            )}
        </div>
    )
}
