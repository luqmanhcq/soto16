'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, Download, Trash2, FileText, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'

type SertifikatWebinarRow = {
    id: number
    webinar_id: number
    nip: string
    nama: string
    jabatan: string | null
    unit_kerja: string | null
    nama_webinar: string
    tanggal_mulai: string | null
    tanggal_selesai: string | null
    jumlah_jp: number | null
    penyelenggara: string | null
    nomor_sertifikat: string
    created_at: string
}

type SertifikatWebinarStats = {
    total: number
    byYear: Array<{ year: number; count: number }>
}

type DeleteConfirm = {
    open: boolean
    item: SertifikatWebinarRow | null
}

export default function AdminSertifikatWebinarPage() {
    const [data, setData] = useState<SertifikatWebinarRow[]>([])
    const [stats, setStats] = useState<SertifikatWebinarStats>({ total: 0, byYear: [] })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterYear, setFilterYear] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm>({ open: false, item: null })
    const [deleting, setDeleting] = useState(false)
    const { user } = useAuth()
    const router = useRouter()

    const fetchData = useCallback(async () => {
        try {
            const params = new URLSearchParams()
            if (filterYear) params.append('year', filterYear)

            const res = await fetch(`/api/admin/sertifikat-webinar?${params.toString()}`)
            const result = await res.json()
            if (res.ok) {
                setData(result.data || [])
                setStats(result.stats || { total: 0, byYear: [] })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [filterYear])

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData()
    }, [user, filterYear, router, fetchData])

    const handleDelete = async (item: SertifikatWebinarRow) => {
        if (!confirm(`Yakin ingin menghapus sertifikat "${item.nomor_sertifikat}" untuk ${item.nama}?`)) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/sertifikat-webinar/${item.id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchData()
            } else {
                alert('Gagal menghapus sertifikat')
            }
        } catch (err) {
            console.error(err)
            alert('Terjadi kesalahan saat menghapus')
        } finally {
            setDeleting(false)
        }
    }

    const handleExport = async () => {
        try {
            const params = new URLSearchParams()
            if (filterYear) params.append('year', filterYear)
            params.append('export', 'csv')

            const res = await fetch(`/api/admin/sertifikat-webinar?${params.toString()}`)
            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `rekap-sertifikat-webinar-${filterYear || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
        } catch (err) {
            console.error(err)
            alert('Gagal mengekspor data')
        }
    }

    const filtered = data.filter(item =>
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.nama_webinar.toLowerCase().includes(search.toLowerCase()) ||
        item.nip.includes(search)
    )

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('id-ID')
    }

    const years = stats.byYear || []

    return (
        <div className="p-8 lg:p-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Rekap <span className="text-indigo-600">Sertifikat Webinar.</span></h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Sertifikat: {stats.total} | Tahun Terpilih: {filterYear || 'Semua'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                        <Download className="h-5 w-5" /> EKSPOR CSV
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 flex items-center gap-3 px-5 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all w-full sm:max-w-md">
                        <Search className="h-5 w-5 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari NIP, nama, atau nama webinar..."
                            className="flex-1 bg-transparent outline-none font-bold text-slate-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter Tahun:</label>
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                            <option value="">Semua Tahun</option>
                            {years.map((y) => (
                                <option key={y.year} value={y.year.toString()}>
                                    {y.year} ({y.count} sertifikat)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">NIP</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jabatan</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Kerja</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Webinar</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tgl Mulai</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tgl Selesai</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">JP</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Penyelenggara</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Sertifikat</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tgl Generate</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={13} className="px-8 py-20 text-center">
                                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700 font-mono">{item.nip}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.nama}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.jabatan || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.unit_kerja || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700 max-w-md truncate" title={item.nama_webinar}>{item.nama_webinar}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(item.tanggal_mulai)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(item.tanggal_selesai)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 text-center">{item.jumlah_jp || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={item.penyelenggara || '-'}>{item.penyelenggara || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-indigo-600 font-mono max-w-xs truncate" title={item.nomor_sertifikat}>{item.nomor_sertifikat}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(item.created_at)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.open(`/api/webinar/${item.webinar_id}/sertifikat/pdf?user_id=${item.id}`, '_blank')}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Lihat/Unduh Sertifikat"
                                                >
                                                    <FileText className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ open: true, item })}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Hapus Sertifikat"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={13} className="px-8 py-20 text-center text-slate-400 italic">
                                        Tidak ada data sertifikat
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.open && deleteConfirm.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Konfirmasi Hapus</h3>
                            </div>
                            <p className="text-slate-600 mb-6">
                                Yakin ingin menghapus sertifikat <strong className="text-slate-900">{deleteConfirm.item.nomor_sertifikat}</strong> untuk <strong className="text-slate-900">{deleteConfirm.item.nama}</strong>?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirm({ open: false, item: null })}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm.item!)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {deleting ? 'Menghapus...' : 'Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
