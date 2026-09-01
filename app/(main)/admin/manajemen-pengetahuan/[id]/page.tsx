'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Plus, Edit, Trash2, Save, X, Loader2, BookOpen,
    FileText, Video, ListVideo, Upload,
    BarChart2, Download, Users, CheckCircle
} from 'lucide-react'
import Link from 'next/link'

const TABS = [
    { key: 'materi', label: 'Materi', icon: BookOpen },
    { key: 'rekap', label: 'Rekap', icon: BarChart2 },
] as const

const TIPE_OPTIONS = [
    { value: 'video', label: 'Video', icon: Video },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'playlist', label: 'Playlist', icon: ListVideo },
] as const

const MEDIA_MAP: Record<string, { icon: any; label: string; bg: string; placeholder: string }> = {
    video: { icon: Video, label: 'Video', bg: 'bg-blue-100 text-blue-700', placeholder: 'URL YouTube / video drive...' },
    pdf: { icon: FileText, label: 'PDF', bg: 'bg-red-100 text-red-700', placeholder: 'URL file PDF...' },
    playlist: { icon: ListVideo, label: 'Playlist', bg: 'bg-purple-100 text-purple-700', placeholder: 'URL YouTube playlist...' },
}

export default function AdminManajemenPengetahuanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('materi')

    useEffect(() => {
        fetch(`/api/manajemen-pengetahuan/${id}`)
            .then(r => r.json())
            .then(d => { setCourse(d.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [id])

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 text-indigo-600 animate-spin" /></div>
    if (!course) return <div className="p-20 text-center font-black text-red-500">Program tidak ditemukan</div>

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/manajemen-pengetahuan" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{course.nama}</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Konten Pengetahuan</p>
                    </div>
                </div>
                <Link href={`/admin/manajemen-pengetahuan/${id}/edit`} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all">
                    Edit Info Program
                </Link>
            </div>

            <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {activeTab === 'materi' && <MateriManager mpId={id} />}
            {activeTab === 'rekap' && <RecapManager mpId={id} />}
        </div>
    )
}

/* ===================== MATERI MANAGER ===================== */
function MateriManager({ mpId }: { mpId: string }) {
    const [materis, setMateris] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ nama: '', urutan: 0, tipe: 'video', link_file: '', link_video: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => { fetchMateris() }, [mpId])

    async function fetchMateris() {
        const res = await fetch(`/api/manajemen-pengetahuan/${mpId}/materi`)
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
                const res = await fetch(`/api/manajemen-pengetahuan/${mpId}/materi/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                })
                if (res.ok) { alert('Materi diperbarui'); resetForm(); fetchMateris() }
                else { const err = await res.json(); alert(err.message || 'Gagal') }
            } else {
                const res = await fetch(`/api/manajemen-pengetahuan/${mpId}/materi`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...form, manajemen_pengetahuan_id: parseInt(mpId) })
                })
                if (res.ok) { alert('Materi ditambahkan'); resetForm(); fetchMateris() }
                else { const err = await res.json(); alert(err.message || 'Gagal') }
            }
        } catch { alert('Terjadi kesalahan') }
        finally { setSaving(false) }
    }

    async function handleDelete(materiId: number) {
        if (!confirm('Hapus materi ini?')) return
        const res = await fetch(`/api/manajemen-pengetahuan/${mpId}/materi/${materiId}`, { method: 'DELETE' })
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
        const t = MEDIA_MAP[tipe] || MEDIA_MAP.video
        return <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${t.bg}`}>{t.label}</span>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">Daftar Materi ({materis.length})</h2>
                {!showForm && (
                    <button onClick={() => { setShowForm(true); setForm(f => ({ ...f, urutan: materis.length })) }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all">
                        <Plus className="h-4 w-4" /> Tambah Materi
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nama Materi</label>
                            <input required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" placeholder="Nama materi..." />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tipe</label>
                            <select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900">
                                <option value="video">Video</option>
                                <option value="pdf">PDF</option>
                                <option value="playlist">Playlist</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Urutan</label>
                            <input type="number" min={0} value={form.urutan} onChange={e => setForm({ ...form, urutan: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" />
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
                        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {editingId ? 'Simpan Perubahan' : 'Tambah Materi'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="py-10 text-center"><Loader2 className="h-6 w-6 text-indigo-600 animate-spin mx-auto" /></div>
            ) : materis.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold">Belum ada materi</div>
            ) : (
                <div className="space-y-3">
                    {materis.map((m, idx) => (
                        <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">{idx + 1}</div>
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
                                <button onClick={() => startEdit(m)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/* ===================== REKAP MANAGER ===================== */
function RecapManager({ mpId }: { mpId: string }) {
    const [recap, setRecap] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => { fetchRecap() }, [mpId])

    async function fetchRecap() {
        setLoading(true)
        const res = await fetch(`/api/manajemen-pengetahuan/${mpId}/recap`)
        const data = await res.json()
        if (res.ok) setRecap(data.data)
        setLoading(false)
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
        (r.nip || '').includes(search) ||
        (r.unit_kerja || '').toLowerCase().includes(search.toLowerCase())
    )

    const summaryCards = [
        { label: 'Total Peserta', value: summary.total_peserta ?? 0, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Total Materi', value: summary.total_materi ?? 0, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
        { label: 'Belum Mulai', value: summary.belum_mulai ?? 0, icon: FileText, color: 'text-slate-600 bg-slate-50' },
        { label: 'Proses', value: summary.proses ?? 0, icon: BarChart2, color: 'text-amber-600 bg-amber-50' },
        { label: 'Selesai', value: summary.selesai ?? 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-800">Rekap Peserta ({rows.length})</h2>

            {loading ? (
                <div className="py-10 text-center"><Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" /></div>
            ) : rows.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Belum ada peserta yang mendaftar program ini</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                            className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-sm"
                        />
                    </div>

                    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Peserta</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Daftar</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progress</th>
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
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {statusBadge(r.progress?.status)}
                                                <span className="text-[10px] font-bold text-slate-400">{r.progress?.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500 font-semibold whitespace-nowrap">
                                            {r.progress?.tanggal_selesai ? new Date(r.progress.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center text-slate-400 font-bold">Tidak ada hasil yang cocok</td>
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