'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    Loader2,
    ClipboardCheck,
    Award,
    AlertCircle,
    RotateCcw,
    Clock,
    Play,
    Pause,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TYPE_LABELS: Record<string, string> = {
    pre_test: 'Pre-Test',
    post_test: 'Post-Test',
    monev: 'Evaluasi (Monev)',
}

export default function TestPage({ params }: { params: Promise<{ id: string; type: string }> }) {
    const { id, type } = use(params)
    const router = useRouter()
    const { user } = useAuth()
    const [course, setCourse] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [existingAnswers, setExistingAnswers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [score, setScore] = useState<{ score: number; total: number; correct: number } | null>(null)
    const [completed, setCompleted] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
    const [testStarted, setTestStarted] = useState(false)
    const [timerPaused, setTimerPaused] = useState(false)

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number | null>(null)

    const typeLabel = TYPE_LABELS[type] || 'Test'
    const isTimedTest = type === 'pre_test' || type === 'post_test'

    // Get test duration from course (in minutes)
    const getTestDuration = (): number => {
        if (!course) return type === 'pre_test' ? 30 : 60
        return type === 'pre_test' ? (course.pre_test_duration || 30) : (course.post_test_duration || 60)
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const [courseRes, questionsRes, answersRes] = await Promise.all([
                    fetch(`/api/pembelajaran/${id}`),
                    fetch(`/api/pembelajaran/${id}/questions?type=${type}`),
                    fetch(`/api/pembelajaran/${id}/answer?type=${type}`),
                ])

                if (courseRes.ok) {
                    const courseData = await courseRes.json()
                    setCourse(courseData.data)
                }

                if (questionsRes.ok) {
                    const qData = await questionsRes.json()
                    setQuestions(qData.data || [])
                }

                if (answersRes.ok) {
                    const aData = await answersRes.json()
                    const existing = aData.data || []
                    setExistingAnswers(existing)

                    if (existing.length > 0) {
                        const answeredMap: Record<number, number> = {}
                        existing.forEach((a: any) => {
                            answeredMap[a.question_id] = a.option_id
                        })
                        setAnswers(answeredMap)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch test data', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id, type])

    // Check if test is already completed
    useEffect(() => {
        if (questions.length > 0 && existingAnswers.length >= questions.length) {
            setCompleted(true)
            fetchScore()
        }
    }, [questions, existingAnswers])

    // Initialize timer when test loads and user hasn't completed
    useEffect(() => {
        if (isTimedTest && !completed && course && questions.length > 0) {
            const storageKey = `test_timer_${id}_${type}_${user?.id}`
            const savedStartTime = localStorage.getItem(storageKey)
            const durationMinutes = getTestDuration()
            const durationSeconds = durationMinutes * 60

            if (savedStartTime) {
                const elapsed = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000)
                const remaining = durationSeconds - elapsed
                if (remaining > 0) {
                    setTimeRemaining(remaining)
                    setTestStarted(true)
                    startTimer(remaining)
                } else {
                    // Time expired, auto-submit
                    handleAutoSubmit()
                }
            } else if (!existingAnswers.length) {
                // First time loading, wait for user to start
                setTimeRemaining(durationSeconds)
            }
        }
    }, [course, questions, completed, existingAnswers.length])

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    function startTimer(initialSeconds: number) {
        if (timerRef.current) clearInterval(timerRef.current)
        startTimeRef.current = Date.now() - (getTestDuration() * 60 - initialSeconds) * 1000

        timerRef.current = setInterval(() => {
            if (timerPaused) return
            setTimeRemaining(prev => {
                if (prev === null || prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current)
                    handleAutoSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    function handleStartTest() {
        const storageKey = `test_timer_${id}_${type}_${user?.id}`
        localStorage.setItem(storageKey, Date.now().toString())
        setTestStarted(true)
        startTimer(getTestDuration() * 60)
    }

    async function handleAutoSubmit() {
        if (completed || submitting) return
        if (Object.keys(answers).length < questions.length) {
            // Still submit whatever is answered
        }
        await handleSubmit(true)
    }

    async function fetchScore() {
        try {
            let correct = 0
            for (const q of questions) {
                const selectedOptionId = answers[q.id]
                if (selectedOptionId !== undefined) {
                    const correctOption = q.options?.find((o: any) => o.is_correct)
                    if (correctOption && selectedOptionId === correctOption.id) {
                        correct++
                    }
                }
            }
            setScore({
                score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
                total: questions.length,
                correct,
            })
        } catch (error) {
            console.error('Failed to fetch score', error)
        }
    }

    function handleAnswerChange(questionId: number, optionId: number) {
        if (completed) return
        setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    }

    async function handleSubmit(autoOrEvent?: boolean | React.MouseEvent<HTMLButtonElement>) {
        const auto = typeof autoOrEvent === 'boolean' ? autoOrEvent : false
        if (!auto && Object.keys(answers).length < questions.length) {
            if (!confirm('Beberapa pertanyaan belum dijawab. Yakin ingin mengirim?')) return
        }

        setSubmitting(true)
        try {
            for (const q of questions) {
                const optionId = answers[q.id]
                if (optionId) {
                    await fetch(`/api/pembelajaran/${id}/answer`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            question_id: q.id,
                            option_id: optionId,
                            type: type,
                        })
                    })
                }
            }

            const storageKey = `test_timer_${id}_${type}_${user?.id}`
            localStorage.removeItem(storageKey)

            setCompleted(true)
            await fetchScore()
            if (!auto) alert('Jawaban berhasil disimpan!')
        } catch (error) {
            console.error('Failed to submit answers', error)
            if (!auto) alert('Gagal menyimpan jawaban')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRetake = () => {
        if (!confirm('Yakin ingin mengulangi Post-Test? Jawaban sebelumnya akan diganti dengan jawaban baru.')) return
        const storageKey = `test_timer_${id}_${type}_${user?.id}`
        localStorage.removeItem(storageKey)
        setCompleted(false)
        setScore(null)
        setAnswers({})
        setExistingAnswers([])
        setTestStarted(false)
        setTimeRemaining(null)
        if (timerRef.current) clearInterval(timerRef.current)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    if (loading) return <div className="p-20 text-center font-black text-indigo-600 animate-pulse">Menyiapkan soal...</div>
    if (!course) return <div className="p-20 text-center font-black text-red-500">Kursus tidak ditemukan</div>

    const durationMinutes = getTestDuration()

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
            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                            <ClipboardCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{typeLabel}</h1>
                            <p className="text-slate-400 font-semibold text-sm mt-1">{course.nama}</p>
                        </div>
                    </div>

                    {isTimedTest && !completed && (
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-lg ${
                            timeRemaining !== null && timeRemaining <= 60 ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                            <Clock className="h-5 w-5" />
                            <span className="font-mono tabular-nums">{timeRemaining !== null ? formatTime(timeRemaining) : `${durationMinutes}:00`}</span>
                            {testStarted && !timerPaused && (
                                <button
                                    onClick={() => setTimerPaused(true)}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Jeda
                                </button>
                            )}
                            {testStarted && timerPaused && (
                                <button
                                    onClick={() => setTimerPaused(false)}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Lanjutkan
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {isTimedTest && !testStarted && !completed && questions.length > 0 && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-6 w-6 text-amber-600" />
                            <div>
                                <p className="font-bold text-amber-800">Waktu Pengerjaan: {durationMinutes} menit</p>
                                <p className="text-sm text-amber-700">Timer akan mulai berjalan saat Anda menekan tombol "Mulai Test". Pastikan Anda siap sebelum memulai.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleStartTest}
                            className="mt-4 w-full bg-amber-500 text-white py-3 rounded-xl font-black text-lg shadow-lg hover:bg-amber-600 transition-all"
                        >
                            <Play className="h-5 w-5 inline mr-2" />
                            MULAI TEST
                        </button>
                    </div>
                )}

                {completed && isTimedTest && score && (
                    <div className={`p-6 rounded-2xl mt-6 ${score.score >= 50 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="flex items-center gap-4">
                            <Award className={`h-10 w-10 ${score.score >= 50 ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <div>
                                <p className={`text-2xl font-black ${score.score >= 50 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    Skor: {score.score}%
                                </p>
                                <p className={`text-sm font-bold ${score.score >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {score.correct} dari {score.total} jawaban benar
                                    {type === 'post_test' && score.score < 50 && ' — belum mencapai nilai minimum (50%)'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {completed && !isTimedTest && (
                    <div className="p-6 rounded-2xl mt-6 bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            <div>
                                <p className="text-xl font-black text-emerald-700">Jawaban Anda telah tersimpan</p>
                                <p className="text-sm font-bold text-emerald-600">Terima kasih telah mengisi evaluasi.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Questions */}
            {questions.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-xl font-bold text-slate-500">Belum ada soal untuk {typeLabel}</p>
                    <p className="text-slate-400 text-sm mt-2">Hubungi administrator untuk informasi lebih lanjut.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q, qIdx) => (
                        <div key={q.id} className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                            <p className="font-black text-slate-800 text-lg mb-6">
                                <span className="text-indigo-600 mr-2">{qIdx + 1}.</span>
                                {q.question_text}
                            </p>
                            <div className="space-y-3">
                                {q.options?.map((o: any, oIdx: number) => {
                                    const isSelected = answers[q.id] === o.id
                                    const isCorrect = o.is_correct
                                    const showResult = completed

                                    return (
                                        <label
                                            key={o.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                                showResult
                                                    ? isCorrect
                                                        ? 'border-emerald-400 bg-emerald-50'
                                                        : isSelected
                                                            ? 'border-red-400 bg-red-50'
                                                            : 'border-slate-100 bg-slate-50'
                                                    : isSelected
                                                        ? 'border-indigo-400 bg-indigo-50'
                                                        : 'border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/50'
                                            } ${completed || (isTimedTest && !testStarted) ? 'cursor-default' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${q.id}`}
                                                checked={isSelected}
                                                onChange={() => handleAnswerChange(q.id, o.id)}
                                                disabled={completed || (isTimedTest && !testStarted)}
                                                className="h-5 w-5 text-indigo-600"
                                            />
                                            <span className={`font-medium flex-1 ${showResult && isCorrect ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                                                <span className="font-black mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                                                {o.option_text}
                                            </span>
                                            {showResult && isCorrect && (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                            )}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Submit Button */}
            {questions.length > 0 && !completed && (!isTimedTest || testStarted) && (
                <div className="sticky bottom-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-500">
                        Dijawab: <span className="text-indigo-600 font-black">{Object.keys(answers).length}</span> / {questions.length}
                    </p>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        KIRIM JAWABAN
                    </button>
                </div>
            )}

            {/* Back to course button when completed */}
            {completed && (
                <div className="space-y-3">
                    {type === 'post_test' && score && score.score < 50 && (
                        <button
                            onClick={handleRetake}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-xl font-black text-sm shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95"
                        >
                            <RotateCcw className="h-5 w-5" />
                            ULANGI POST-TEST
                        </button>
                    )}
                    <div className="text-center">
                        <Link
                            href={`/pembelajaran/${id}`}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                        >
                            Kembali ke Kursus
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}