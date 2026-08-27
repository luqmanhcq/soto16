'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Plus, Edit, Trash2, Save, X, Loader2, BookOpen,
    FileText, Video, ListVideo, HelpCircle, CheckCircle, AlertCircle, Upload,
    BarChart2, Download, Users
} from 'lucide-react'
import Link from 'next/link'

const TABS = [
    { key: 'materi', label: 'Materi', icon: BookOpen },
    { key: 'pre_test', label: 'Pre-Test', icon: FileText },
    { key: 'post_test', label: 'Post-Test', icon: FileText },
    { key: 'monev', label: 'Monev', icon: HelpCircle },
    { key: 'rekap', label: 'Rekap', icon: BarChart2 },
] as const

const TIPE_OPTIONS = [
    { value: 'video', label: 'Video', icon: Video },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'playlist', label: 'Playlist', icon: ListVideo },
] as const

export default function AdminPembelajaranDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('materi')

    useEffect(() => {
        fetch(`/api/pembelajaran/${id}`)
            .then(r => r.json())
            .then(d => { setCourse(d.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [id])

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 text-emerald-600 animate-spin" /></div>
    if (!course) return <div className="p-20 text-center font-black text-red-500">Kursus tidak ditemukan</div>

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pembelajaran" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{course.nama}</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Konten Pembelajaran</p>
                    </div>
                </div>
                <Link href={`/admin/pembelajaran/${id}/edit`} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all">
                    Edit Info Kursus
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'materi' && <MateriManager pembelajaranId={id} />}
            {activeTab === 'pre_test' && <QuestionManager pembelajaranId={id} type="pre_test" title="Pre-Test" />}
            {activeTab === 'post_test' && <QuestionManager pembelajaranId={id} type="post_test" title="Post-Test" />}
            {activeTab === 'monev' && <QuestionManager pembelajaranId={id} type="monev" title="Evaluasi (Monev)" />}
            {activeTab === 'rekap' && <RecapManager pembelajaranId={id} />}
        </div>
    )
}

/* ===================== MATERI MANAGER ===================== */
function MateriManager({ pembelajaranId }: { pembelajaranId: string }) {
    const [materis, setMateris] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ nama: '', urutan: 0, tipe: 'video', link_file: '', link_video: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => { fetchMateris() }, [pembelajaranId])

    async function fetchMateris() {
        const res = await fetch(`/api/pembelajaran/${pembelajaranId}/materi`)
        const data = await res.json()
        if (res.ok) setMateris(data.data || [])
        setLoading(false)
    }

    function resetForm() {
        setForm({ nama: '', urutan: materis.length, tipe: 'video', link_file: '', link_video: '' })
        setEditingId(null)
        setShowForm(false)
    }

    function startEdit(m: any) {
        setForm({ nama: m.nama, urutan: m.urutan, tipe: m.tipe || 'video', link_file: m.link_file || '', link_video: m.link_video || '' })
        setEditingId(m.id)
        setShowForm(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            if (editingId) {
                const res = await fetch(`/api/pembelajaran/${pembelajaranId}/materi/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                })
                if (res.ok) { alert('Materi diperbarui'); resetForm(); fetchMateris() }
                else { const err = await res.json(); alert(err.message || 'Gagal') }
            } else {
                const res = await fetch(`/api/pembelajaran/${pembelajaranId}/materi`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...form, pembelajaran_id: parseInt(pembelajaranId) })
                })
                if (res.ok) { alert('Materi ditambahkan'); resetForm(); fetchMateris() }
                else { const err = await res.json(); alert(err.message || 'Gagal') }
            }
        } catch { alert('Terjadi kesalahan') }
        finally { setSaving(false) }
    }

    async function handleDelete(materiId: number) {
        if (!confirm('Hapus materi ini?')) return
        const res = await fetch(`/api/pembelajaran/${pembelajaranId}/materi/${materiId}`, { method: 'DELETE' })
        if (res.ok) fetchMateris()
        else alert('Gagal menghapus')
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'link_file' | 'link_video') {
        const file = e.target.files?.[0]
        if (!file) return
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) setForm(prev => ({ ...prev, [field]: data.url }))
        else alert('Gagal upload')
    }

    const tipeBadge = (tipe: string) => {
        const map: Record<string, { bg: string; label: string }> = {
            video: { bg: 'bg-blue-100 text-blue-700', label: 'VIDEO' },
            pdf: { bg: 'bg-red-100 text-red-700', label: 'PDF' },
            playlist: { bg: 'bg-purple-100 text-purple-700', label: 'PLAYLIST' },
        }
        const t = map[tipe] || map.video
        return <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${t.bg}`}>{t.label}</span>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">Daftar Materi ({materis.length})</h2>
                {!showForm && (
                    <button onClick={() => { setShowForm(true); setForm(f => ({ ...f, urutan: materis.length })) }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all">
                        <Plus className="h-4 w-4" /> Tambah Materi
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nama Materi</label>
                            <input required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900" placeholder="Nama materi..." />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tipe</label>
                            <select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900">
                                <option value="video">Video</option>
                                <option value="pdf">PDF</option>
                                <option value="playlist">Playlist</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Urutan</label>
                            <input type="number" min={0} value={form.urutan} onChange={e => setForm({ ...form, urutan: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900" />
                        </div>
                        {(form.tipe === 'pdf') && (
                            <div className="sm:col-span-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">File PDF</label>
                                <div className="flex gap-2">
                                    <input value={form.link_file} onChange={e => setForm({ ...form, link_file: e.target.value })} className="flex-1 bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 font-bold text-slate-900 text-sm" placeholder="URL file PDF..." />
                                    <label className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-all font-bold text-sm text-slate-600">
                                        <Upload className="h-4 w-4" /> Upload
                                        <input type="file" accept=".pdf" className="hidden" onChange={e => handleFileUpload(e, 'link_file')} />
                                    </label>
                                </div>
                            </div>
                        )}
                        {(form.tipe === 'video' || form.tipe === 'playlist') && (
                            <div className="sm:col-span-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Link Video / Playlist</label>
                                <input value={form.link_video} onChange={e => setForm({ ...form, link_video: e.target.value })} className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 font-bold text-slate-900 text-sm" placeholder="URL YouTube atau playlist..." />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-700">Batal</button>
                        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {editingId ? 'Simpan Perubahan' : 'Tambah Materi'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="py-10 text-center"><Loader2 className="h-6 w-6 text-emerald-600 animate-spin mx-auto" /></div>
            ) : materis.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold">Belum ada materi</div>
            ) : (
                <div className="space-y-3">
                    {materis.map((m, idx) => (
                        <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm">{idx + 1}</div>
                                <div>
                                    <p className="font-bold text-slate-800">{m.nama}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {tipeBadge(m.tipe || 'video')}
                                        {m.link_video && <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{m.link_video}</span>}
                                        {m.link_file && <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{m.link_file}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(m)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/* ===================== QUESTION MANAGER ===================== */
function QuestionManager({ pembelajaranId, type, title }: { pembelajaranId: string; type: string; title: string }) {
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [questionText, setQuestionText] = useState('')
    const [options, setOptions] = useState<{ option_text: string; is_correct: boolean; order: number }[]>([
        { option_text: '', is_correct: false, order: 0 },
        { option_text: '', is_correct: false, order: 1 },
    ])
    const [saving, setSaving] = useState(false)

    useEffect(() => { fetchQuestions() }, [pembelajaranId, type])

    async function fetchQuestions() {
        setLoading(true)
        const res = await fetch(`/api/pembelajaran/${pembelajaranId}/questions?type=${type}`)
        const data = await res.json()
        if (res.ok) setQuestions(data.data || [])
        setLoading(false)
    }

    function resetForm() {
        setQuestionText('')
        setOptions([
            { option_text: '', is_correct: false, order: 0 },
            { option_text: '', is_correct: false, order: 1 },
        ])
        setEditingId(null)
        setShowForm(false)
    }

    function startEdit(q: any) {
        setQuestionText(q.question_text)
        setOptions(q.options?.map((o: any, i: number) => ({ option_text: o.option_text, is_correct: o.is_correct, order: i })) || [
            { option_text: '', is_correct: false, order: 0 },
            { option_text: '', is_correct: false, order: 1 },
        ])
        setEditingId(q.id)
        setShowForm(true)
    }

    function updateOption(idx: number, field: string, value: any) {
        setOptions(prev => prev.map((o, i) => {
            if (i !== idx) return o
            if (field === 'is_correct' && value) {
                return { ...o, is_correct: true }
            }
            return { ...o, [field]: value }
        }))
    }

    function addOption() {
        setOptions(prev => [...prev, { option_text: '', is_correct: false, order: prev.length }])
    }

    function removeOption(idx: number) {
        if (options.length <= 2) return alert('Minimal 2 opsi jawaban')
        setOptions(prev => prev.filter((_, i) => i !== idx).map((o, i) => ({ ...o, order: i })))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!questionText.trim()) return alert('Pertanyaan tidak boleh kosong')
        if (options.some(o => !o.option_text.trim())) return alert('Semua opsi harus diisi')
        if (!options.some(o => o.is_correct)) return alert('Tandai satu jawaban yang benar')

        setSaving(true)
        try {
            if (editingId) {
                const res = await fetch(`/api/pembelajaran/${pembelajaranId}/questions/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question_text: questionText, options, order: questions.findIndex(q => q.id === editingId) })
                })
                if (res.ok) { alert('Pertanyaan diperbarui'); resetForm(); fetchQuestions() }
                else { const err = await res.json(); alert(err.message || 'Gagal') }
            } else {
                const res = await fetch(`/api/pembelajaran/${pembelajaranId}/questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pembelajaran_id: parseInt(pembelajaranId),
                        type,
                        question_text: questionText,
                        order: questions.length,
                        options,
                    })
                })
                if (res.ok) { alert('Pertanyaan ditambahkan'); resetForm(); fetchQuestions() }
                else { const err = await res.json(); alert(err.message || 'Gagal') }
            }
        } catch { alert('Terjadi kesalahan') }
        finally { setSaving(false) }
    }

    async function handleDelete(questionId: number) {
        if (!confirm('Hapus pertanyaan ini?')) return
        const res = await fetch(`/api/pembelajaran/${pembelajaranId}/questions/${questionId}`, { method: 'DELETE' })
        if (res.ok) fetchQuestions()
        else alert('Gagal menghapus')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">{title} — {questions.length} Pertanyaan</h2>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all">
                        <Plus className="h-4 w-4" /> Tambah Pertanyaan
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Pertanyaan</label>
                        <textarea required value={questionText} onChange={e => setQuestionText(e.target.value)} rows={2} className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900" placeholder="Tulis pertanyaan..." />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Opsi Jawaban</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <button type="button" onClick={() => updateOption(idx, 'is_correct', true)} className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${opt.is_correct ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 hover:border-emerald-400'}`}>
                                    {opt.is_correct && <CheckCircle className="h-4 w-4" />}
                                </button>
                                <input
                                    value={opt.option_text}
                                    onChange={e => updateOption(idx, 'option_text', e.target.value)}
                                    className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 text-sm"
                                    placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                                />
                                {options.length > 2 && (
                                    <button type="button" onClick={() => removeOption(idx)} className="p-1.5 text-slate-400 hover:text-red-500 transition-all"><X className="h-4 w-4" /></button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addOption} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Tambah Opsi
                        </button>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-700">Batal</button>
                        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {editingId ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="py-10 text-center"><Loader2 className="h-6 w-6 text-emerald-600 animate-spin mx-auto" /></div>
            ) : questions.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold">Belum ada pertanyaan untuk {title}</div>
            ) : (
                <div className="space-y-4">
                    {questions.map((q, qIdx) => (
                        <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <p className="font-bold text-slate-800 flex-1">
                                    <span className="text-emerald-600 mr-2">{qIdx + 1}.</span>{q.question_text}
                                </p>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                    <button onClick={() => startEdit(q)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <div className="space-y-1.5 ml-6">
                                {q.options?.map((o: any, oIdx: number) => (
                                    <div key={o.id} className={`flex items-center gap-2 text-sm ${o.is_correct ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                                        <span className="font-black text-xs">{String.fromCharCode(65 + oIdx)}.</span>
                                        <span>{o.option_text}</span>
                                        {o.is_correct && <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/* ===================== REKAP MANAGER ===================== */
function RecapManager({ pembelajaranId }: { pembelajaranId: string }) {
    const [recap, setRecap] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => { fetchRecap() }, [pembelajaranId])

    async function fetchRecap() {
        setLoading(true)
        const res = await fetch(`/api/pembelajaran/${pembelajaranId}/recap`)
        const data = await res.json()
        if (res.ok) setRecap(data.data)
        setLoading(false)
    }

    const handleDownload = () => {
        window.open(`/api/pembelajaran/${pembelajaranId}/recap?export=excel`, '_blank')
    }

    const statusBadge = (status: string) => {
        const map: Record<string, { bg: string; label: string }> = {
            selesai: { bg: 'bg-emerald-100 text-emerald-700', label: 'SELESAI' },
            proses: { bg: 'bg-amber-100 text-amber-700', label: 'PROSES' },
            belum_mulai: { bg: 'bg-slate-100 text-slate-500', label: 'BELUM' },
        }
        const s = map[status] || map.belum_mulai
        return <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase whitespace-nowrap ${s.bg}`}>{s.label}</span>
    }

    const rows = recap?.rows || []
    const summary = recap?.summary || {}
    const filtered = rows.filter((r: any) =>
        !search ||
        r.nama.toLowerCase().includes(search.toLowerCase()) ||
        r.nip.includes(search) ||
        r.unit_kerja?.toLowerCase().includes(search.toLowerCase())
    )

    const summaryCards = [
        { label: 'Total Peserta', value: summary.total_peserta ?? 0, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Pre-Test Selesai', value: summary.pre_test_selesai ?? 0, icon: FileText, color: 'text-blue-600 bg-blue-50' },
        { label: 'Post-Test Selesai', value: summary.post_test_selesai ?? 0, icon: FileText, color: 'text-amber-600 bg-amber-50' },
        { label: 'Post-Test Lulus', value: summary.post_test_lulus ?? 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Monev Selesai', value: summary.monev_selesai ?? 0, icon: HelpCircle, color: 'text-purple-600 bg-purple-50' },
        { label: 'Materi Selesai', value: summary.selesai ?? 0, icon: BookOpen, color: 'text-rose-600 bg-rose-50' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">Rekap Peserta ({rows.length})</h2>
                <button
                    onClick={handleDownload}
                    disabled={loading || rows.length === 0}
                    className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95 leading-none"
                >
                    <Download className="h-5 w-5" /> EXPORT EXCEL (.xlsx)
                </button>
            </div>

            {loading ? (
                <div className="py-10 text-center"><Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto" /></div>
            ) : rows.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Belum ada peserta yang mendaftar pembelajaran ini</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {summaryCards.map(card => {
                            const Icon = card.icon
                            return (
                                <div key={card.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${card.color} mb-2`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{card.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                                </div>
                            )
                        })}
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari NIP / Nama / Unit Kerja..."
                            className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 text-sm"
                        />
                    </div>

                    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Peserta</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Daftar</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pre-Test</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Post-Test</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Monev</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Materi</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Selesai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-900">
                                {filtered.length > 0 ? filtered.map((r: any, idx: number) => (
                                    <tr key={r.user_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4 text-slate-400 font-bold text-sm">{idx + 1}</td>
                                        <td className="px-5 py-4">
                                            <p className="font-black text-slate-800 text-sm">{r.nama}</p>
                                            <p className="text-xs text-slate-400 font-bold">{r.nip}</p>
                                            <p className="text-xs text-slate-400">{r.jabatan}{r.unit_kerja ? ` — ${r.unit_kerja}` : ''}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500 font-semibold whitespace-nowrap">
                                            {r.enrolled_at ? new Date(r.enrolled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                            {r.pre_test.completed ? (
                                                <span className={`px-2.5 py-1 rounded-lg text-sm font-black ${r.pre_test.score >= 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{r.pre_test.score}%</span>
                                            ) : (
                                                <span className="text-slate-300 font-bold text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                            {r.post_test.completed ? (
                                                <span className={`px-2.5 py-1 rounded-lg text-sm font-black ${r.post_test.score >= 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{r.post_test.score}%</span>
                                            ) : (
                                                <span className="text-slate-300 font-bold text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                            {r.monev.completed ? (
                                                <span className="px-2.5 py-1 rounded-lg text-sm font-black bg-purple-50 text-purple-700">Selesai</span>
                                            ) : (
                                                <span className="text-slate-300 font-bold text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {statusBadge(r.progress.status)}
                                                <span className="text-[10px] font-bold text-slate-400">{r.progress.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500 font-semibold whitespace-nowrap">
                                            {r.progress.tanggal_selesai ? new Date(r.progress.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-16 text-center text-slate-400 font-bold">Tidak ada hasil yang cocok</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
