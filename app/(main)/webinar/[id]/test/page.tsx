'use client'

import React, { useState, useEffect, use } from 'react'
import {
    ChevronLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Send,
    HelpCircle,
    Timer
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'

export default function WebinarTestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const webinarId = parseInt(id)
    const searchParams = useSearchParams()
    const type = searchParams.get('type') as 'post_test' | 'monev'
    const router = useRouter()
    const { user } = useAuth()

    const [webinar, setWebinar] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [score, setScore] = useState<number | null>(null)

    useEffect(() => {
        if (!type || (type !== 'post_test' && type !== 'monev')) {
            router.push(`/webinar/${id}`)
            return
        }
        fetchData()
    }, [id, type])

    async function fetchData() {
        setLoading(true)
        try {
            // Fetch webinar info
            const webRes = await fetch(`/api/webinar/${webinarId}`)
            const webData = await webRes.json()
            if (webRes.ok) setWebinar(webData.data)

            // Fetch questions
            const res = await fetch(`/api/webinar/${webinarId}/questions?type=${type}`)
            const data = await res.json()
            if (res.ok) setQuestions(data.data || [])

            // Check submission status (score & whether can retake)
            try {
                const checkRes = await fetch(`/api/webinar/${webinarId}/questions/submit?type=${type}`)
                const checkData = await checkRes.json()
                if (checkRes.ok && checkData.data) {
                    if (checkData.data.submitted) {
                        setCompleted(true)
                        if (type === 'post_test') {
                            setScore(checkData.data.score)
                        }
                    }
                }
            } catch (e) {
                console.error('Gagal cek status submit:', e)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (questionId: number, optionId: number) => {
        setAnswers({ ...answers, [questionId]: optionId })
    }

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            alert('Harap jawab semua pertanyaan terlebih dahulu.')
            return
        }

        if (!confirm(`Yakin ingin mengirimkan ${type === 'post_test' ? 'Post-test' : 'Monev'} ini?`)) return

        setSubmitting(true)
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
                question_id: parseInt(qId),
                option_id: oId
            }))

            const res = await fetch(`/api/webinar/${webinarId}/questions/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, answers: formattedAnswers })
            })
            const result = await res.json()

            if (res.ok) {
                setCompleted(true)
                if (type === 'post_test') {
                    // Calculate score locally for immediate feedback
                    let correct = 0
                    questions.forEach(q => {
                        const selectedOptId = answers[q.id]
                        const correctOpt = q.options.find((o: any) => o.is_correct)
                        if (correctOpt && correctOpt.id === selectedOptId) {
                            correct++
                        }
                    })
                    const calculatedScore = Math.round((correct / questions.length) * 100)
                    setScore(calculatedScore)
                }
            } else {
                alert(result.message)
            }
        } catch (error) {
            alert('Terjadi kesalahan saat mengirim jawaban')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRetake = () => {
        if (!confirm('Yakin ingin mengulangi Post-test? Jawaban sebelumnya akan diganti dengan jawaban baru.')) return
        setCompleted(false)
        setScore(null)
        setAnswers({})
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">Menyiapkan Lembar Jawaban...</p>
            </div>
        )
    }

    if (completed) {
        const isPostTest = type === 'post_test'
        const passed = isPostTest ? (score !== null && score >= 50) : true
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 lg:p-24">
                <div className="max-w-md w-full bg-indigo-50 rounded-[3rem] p-12 text-center space-y-8 border border-indigo-100 shadow-2xl shadow-indigo-100/50">
                    <div className={`h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl ${passed ? 'bg-white shadow-indigo-200/50' : 'bg-amber-50 shadow-amber-200/50'}`}>
                        {passed ? (
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                        ) : (
                            <AlertCircle className="h-12 w-12 text-amber-500" />
                        )}
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                            {isPostTest
                                ? (passed ? 'Post-Test Selesai' : 'Post-Test Belum Lulus')
                                : 'Monev Terkirim'}
                        </h2>
                        <p className="text-slate-500 font-bold italic leading-relaxed">
                            {isPostTest
                                ? passed
                                    ? `Selamat! Anda telah lulus post-test untuk webinar "${webinar?.nama_webinar}".`
                                    : 'Nilai Post-test Anda belum mencapai batas minimal. Silakan ulangi Post-test.'
                                : `Terima kasih atas umpan balik Anda untuk webinar "${webinar?.nama_webinar}".`}
                        </p>
                    </div>
                    
                    {score !== null && (
                        <div className={`bg-white p-6 rounded-2xl border ${passed ? 'border-emerald-100' : 'border-amber-100'}`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nilai Anda</p>
                            <p className={`text-5xl font-black italic tracking-tighter ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>{score}%</p>
                            {!passed ? (
                                <p className="text-[10px] font-bold text-red-500 uppercase mt-2 italic tracking-tight flex items-center justify-center gap-2">
                                    <AlertCircle className="h-3 w-3" /> Belum mencapai nilai minimum (50%)
                                </p>
                            ) : (
                                <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2 italic tracking-tight flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-3 w-3" /> Lulus Ambang Batas
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        {isPostTest && !passed && (
                            <button
                                onClick={handleRetake}
                                className="block w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-200 active:scale-95"
                            >
                                ULANGI POST-TEST
                            </button>
                        )}

                        <Link
                            href={`/webinar/${id}`}
                            className="block w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                        >
                            Kembali ke Detail Webinar
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-6">
                <HelpCircle className="h-20 w-20 text-slate-100" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic">Belum Ada Pertanyaan</h2>
                    <p className="text-slate-400 font-bold italic">Admin belum merilis daftar pertanyaan untuk {type === 'post_test' ? 'Post-test' : 'Monev'} ini.</p>
                </div>
                <Link href={`/webinar/${id}`} className="text-indigo-600 font-black border-b-2 border-indigo-50 hover:border-indigo-600 transition-all text-xs uppercase tracking-widest">
                    Kembali
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href={`/webinar/${id}`} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                        <ChevronLeft className="h-6 w-6 text-slate-400" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                            {type === 'post_test' ? 'Evaluasi Pembelajaran (Post-Test)' : 'Monitoring & Evaluasi (Monev)'}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic line-clamp-1 max-w-xs md:max-w-md">
                            {webinar?.nama_webinar}
                        </p>
                    </div>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Timer className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 italic">Instruksi Pengerjaan</p>
                            <p className="font-bold text-lg leading-snug italic">Harap jawab {questions.length} pertanyaan di bawah ini dengan jujur dan teliti.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {questions.map((q, qIdx) => (
                        <div key={q.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${qIdx * 100}ms` }}>
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Pertanyaan {qIdx + 1}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 leading-[1.2] italic tracking-tight">{q.question_text}</h3>
                            </div>

                            <div className="grid gap-4">
                                {q.options.map((opt: any) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSelect(q.id, opt.id)}
                                        className={`group relative flex items-center p-6 rounded-[2rem] border-2 transition-all text-left overflow-hidden ${
                                            answers[q.id] === opt.id 
                                            ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100' 
                                            : 'bg-white border-slate-50 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`h-8 w-8 rounded-xl border-2 flex items-center justify-center mr-6 transition-all ${
                                            answers[q.id] === opt.id
                                            ? 'bg-indigo-600 border-indigo-600 text-white rotate-12 scale-110'
                                            : 'border-slate-200 text-transparent'
                                        }`}>
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <span className={`text-lg font-bold italic transition-all ${
                                            answers[q.id] === opt.id ? 'text-indigo-900' : 'text-slate-600'
                                        }`}>
                                            {opt.option_text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-10">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-slate-200 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> MENGIRIM JAWABAN...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" /> KIRIM {type === 'post_test' ? 'POST-TEST' : 'MONEV'}
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    )
}
