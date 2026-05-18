'use client'

import React, { useState, useEffect, use } from 'react'
import {
    Plus,
    Trash2,
    Save,
    ChevronLeft,
    CheckCircle2,
    Circle,
    LayoutList,
    ClipboardCheck,
    MessageSquare,
    Loader2,
    GripVertical,
    BarChart3,
    AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'

interface Option {
    id?: number
    option_text: string
    is_correct: boolean
    order: number
}

interface Question {
    id?: number
    question_text: string
    type: 'post_test' | 'monev'
    order: number
    options: Option[]
}

export default function WebinarQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const webinarId = parseInt(id)
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Tab state from URL or default
    const [activeTab, setActiveTab] = useState<'post_test' | 'monev'>((searchParams.get('type') as any) || 'post_test')
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [webinar, setWebinar] = useState<any>(null)
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        fetchData()
    }, [user, activeTab])

    async function fetchData() {
        setLoading(true)
        setQuestions([]) // Clear before fetch to prevent mixed data
        try {
            const webRes = await fetch(`/api/webinar/${webinarId}`)
            const webData = await webRes.json()
            if (webRes.ok) setWebinar(webData.data)

            const res = await fetch(`/api/webinar/${webinarId}/questions?type=${activeTab}`)
            const data = await res.json()
            if (res.ok) {
                setQuestions(data.data || [])
                setIsDirty(false)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const switchTab = (tab: 'post_test' | 'monev') => {
        if (isDirty && !confirm('Anda memiliki perubahan yang belum disimpan. Pindah tab akan menghapus perubahan tersebut. Lanjutkan?')) {
            return
        }
        setActiveTab(tab)
        // Update URL
        router.push(`/admin/webinar/${webinarId}/questions?type=${tab}`)
    }

    const addQuestion = () => {
        const newQuestion: Question = {
            question_text: '',
            type: activeTab,
            order: questions.length,
            options: [
                { option_text: '', is_correct: false, order: 0 },
                { option_text: '', is_correct: false, order: 1 }
            ]
        }
        setQuestions([...questions, newQuestion])
        setIsDirty(true)
    }

    const removeQuestion = (index: number) => {
        const updated = [...questions]
        updated.splice(index, 1)
        setQuestions(updated)
        setIsDirty(true)
    }

    const updateQuestionText = (index: number, text: string) => {
        const updated = [...questions]
        updated[index].question_text = text
        setQuestions(updated)
        setIsDirty(true)
    }

    const addOption = (qIndex: number) => {
        const updated = [...questions]
        updated[qIndex].options.push({
            option_text: '',
            is_correct: false,
            order: updated[qIndex].options.length
        })
        setQuestions(updated)
        setIsDirty(true)
    }

    const removeOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions]
        updated[qIndex].options.splice(oIndex, 1)
        setQuestions(updated)
        setIsDirty(true)
    }

    const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
        const updated = [...questions]
        updated[qIndex].options[oIndex].option_text = text
        setQuestions(updated)
        setIsDirty(true)
    }

    const setCorrectOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions]
        updated[qIndex].options.forEach((opt, idx) => {
            opt.is_correct = idx === oIndex
        })
        setQuestions(updated)
        setIsDirty(true)
    }

    const handleSaveAll = async () => {
        // Validation
        if (questions.length === 0) return alert('Tambahkan setidaknya satu pertanyaan')
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            if (!q.question_text) return alert(`Teks pertanyaan #${i+1} harus diisi`)
            if (q.options.some(o => !o.option_text)) return alert(`Semua pilihan jawaban pada pertanyaan #${i+1} harus diisi`)
            if (activeTab === 'post_test' && !q.options.some(o => o.is_correct)) {
                return alert(`Pilih satu jawaban yang benar untuk Post-test pada pertanyaan #${i+1}`)
            }
        }

        setSaving(true)
        try {
            const res = await fetch(`/api/webinar/${webinarId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: activeTab, questions })
            })
            const result = await res.json()
            if (res.ok) {
                alert('Seluruh perubahan berhasil disimpan')
                setIsDirty(false)
                fetchData() // Refresh to get new IDs
            } else {
                alert(result.message)
            }
        } catch (error) {
            alert('Terjadi kesalahan saat menyimpan')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Link
                        href="/admin/webinar"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-all text-xs uppercase tracking-widest"
                    >
                        <ChevronLeft className="h-4 w-4" /> Kembali ke Manajemen
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Kuis & <span className="text-indigo-600">Evaluasi.</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">
                        Webinar: {webinar?.nama_webinar || 'Loading...'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href={`/admin/webinar/${webinarId}/questions/results?type=${activeTab}`}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-slate-100/50"
                    >
                        <BarChart3 className="h-5 w-5 text-indigo-600" /> HASIL & ANALITIK
                    </Link>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving || !isDirty}
                        className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        SIMPAN SEMUA PERUBAHAN
                    </button>
                </div>
            </header>

            {isDirty && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-700 text-xs font-bold uppercase tracking-tight animate-pulse">
                    <AlertTriangle className="h-4 w-4" /> Anda memiliki perubahan yang belum disimpan!
                </div>
            )}

            <div className="flex gap-4 border-b border-slate-100 p-2 bg-slate-50 rounded-[2rem]">
                <button
                    onClick={() => switchTab('post_test')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'post_test' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <ClipboardCheck className="h-4 w-4" /> Post-Test (Soal)
                </button>
                <button
                    onClick={() => switchTab('monev')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'monev' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <MessageSquare className="h-4 w-4" /> Monev (Umpan Balik)
                </button>
            </div>

            <div className="space-y-8 pb-20">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sinkronisasi Data...</p>
                    </div>
                ) : (
                    <>
                        {questions.map((q, qIdx) => (
                            <div key={qIdx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden group">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <LayoutList className="h-3 w-3" /> Pertanyaan #{qIdx + 1}
                                            </label>
                                            <textarea
                                                className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none"
                                                rows={2}
                                                placeholder="Tuliskan pertanyaan di sini..."
                                                value={q.question_text}
                                                onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeQuestion(qIdx)}
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilihan Jawaban</label>
                                        <div className="grid gap-3">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex items-center gap-3 group/opt">
                                                    <button
                                                        onClick={() => setCorrectOption(qIdx, oIdx)}
                                                        className={`p-2 rounded-xl transition-all relative group/key ${opt.is_correct ? 'text-emerald-500 bg-emerald-50' : 'text-slate-200 hover:text-slate-400'}`}
                                                        title={activeTab === 'post_test' ? 'Set sebagai Kunci Jawaban' : 'Opsi jawaban'}
                                                    >
                                                        {opt.is_correct ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                                        {opt.is_correct && activeTab === 'post_test' && (
                                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                            </span>
                                                        )}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        className={`flex-1 border p-4 rounded-2xl font-bold text-slate-700 placeholder:text-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-50 outline-none transition-all ${opt.is_correct && activeTab === 'post_test' ? 'bg-emerald-50/30 border-emerald-100 shadow-inner' : 'bg-slate-50/50 border-slate-100'}`}
                                                        placeholder={`Pilihan ${oIdx + 1}...`}
                                                        value={opt.option_text}
                                                        onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                                                    />
                                                    <button
                                                        onClick={() => removeOption(qIdx, oIdx)}
                                                        className="p-2 text-slate-200 hover:text-red-400 opacity-0 group-hover/opt:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => addOption(qIdx)}
                                            className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:gap-4 transition-all"
                                        >
                                            <Plus className="h-3 w-3" /> Tambah Pilihan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addQuestion}
                            className="w-full py-10 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-indigo-400 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                        >
                            <div className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-slate-100 flex items-center justify-center group-hover:scale-110 transition-all">
                                <Plus className="h-6 w-6" />
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest">Tambah Pertanyaan Baru</span>
                        </button>
                    </>
                )}
            </div>
            
            {!loading && questions.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                    <button
                        onClick={handleSaveAll}
                        disabled={saving || !isDirty}
                        className="inline-flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-400 hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:bg-slate-300"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 text-indigo-400" />}
                        SIMPAN SELURUH PERTANYAAN ({questions.length})
                    </button>
                </div>
            )}
        </div>
    )
}
