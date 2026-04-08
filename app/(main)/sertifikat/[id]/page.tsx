'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Download,
    ExternalLink,
    Trash2,
    Clock,
    FileCheck,
    User,
    Calendar,
    Award,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SertifikatDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { user } = useAuth()
    const [proposal, setProposal] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/sertifikat/${id}`)
                if (res.ok) {
                    const result = await res.json()
                    setProposal(result.data)
                }
            } catch (error) {
                console.error('Failed to fetch certificate detail', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!confirm(`Apakah Anda yakin ingin ${action === 'approve' ? 'menyetujui' : 'menolak'} usulan ini?`)) return

        setActionLoading(true)
        try {
            const url = `/api/sertifikat/${id}/${action}`
            const body = action === 'reject' ? { reason: 'Dokumen tidak sesuai kriteria SI-SOTO' } : {}

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                alert(`Usulan berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}!`)
                router.refresh()
                // Refresh local data
                const refreshRes = await fetch(`/api/sertifikat/${id}`)
                if (refreshRes.ok) {
                    const refreshResult = await refreshRes.json()
                    setProposal(refreshResult.data)
                }
            }
        } catch (error) {
            console.error(`Failed to ${action} proposal`, error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menarik usulan ini?')) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/sertifikat/${id}`, { method: 'DELETE' })
            if (res.ok) {
                alert('Usulan berhasil ditarik/dihapus')
                router.push('/sertifikat')
            }
        } catch (error) {
            console.error('Failed to delete proposal', error)
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return <div className="p-20 text-center font-black text-blue-600 animate-pulse uppercase tracking-widest">Memuat Detail Verifikasi...</div>
    if (!proposal) return <div className="p-20 text-center font-black text-red-500 uppercase tracking-widest">Usulan Tidak Ditemukan</div>

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
    const isOwner = user?.id === proposal.user_id

    return (
        <div className="p-8 lg:p-12 max-w-5xl mx-auto space-y-12 min-h-screen">
            <Link
                href="/sertifikat"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black transition-all mb-4 uppercase tracking-widest text-xs"
            >
                <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
            </Link>

            <div className="grid gap-12 lg:grid-cols-3 items-start">
                <div className="lg:col-span-2 space-y-12">
                    <header className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase border border-blue-100">
                                ID USULAN: #{proposal.id.toString().padStart(4, '0')}
                            </div>
                            {proposal.status === 'diajukan' && isOwner && (
                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1.5 text-red-500 hover:text-red-700 font-black text-[11px] uppercase tracking-tighter"
                                >
                                    <Trash2 className="h-3 w-3" /> Tarik Usulan
                                </button>
                            )}
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">{proposal.nama_diklat}</h1>
                        <div className="flex flex-wrap gap-8 items-center text-slate-500">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <span className="font-bold text-slate-700 uppercase">{new Date(proposal.tanggal_pelaksanaan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Award className="h-5 w-5 text-blue-500" />
                                <span className="font-bold text-slate-700 uppercase">Perolehan: {proposal.jumlah_jp} JP</span>
                            </div>
                        </div>
                    </header>

                    <section className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 divide-y divide-slate-50">
                        <div className="py-6 flex justify-between">
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Penyelenggara</span>
                            <span className="font-black text-slate-800 text-right">{proposal.penyelenggara}</span>
                        </div>
                        <div className="py-6 flex justify-between">
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Tipe Dokumen</span>
                            <span className="font-black text-slate-800 uppercase tracking-tighter">Sertifikat / Piagam Pelatihan</span>
                        </div>
                        <div className="py-6 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Lampiran Bukti</span>
                            <a
                                href={proposal.file_usulan}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-blue-600 font-black text-xs hover:bg-blue-50 transition-all border border-slate-100"
                            >
                                LIHAT BERKAS <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </section>

                    {isAdmin && proposal.user && (
                        <section className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white">
                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Profil Pengusul ASN</h3>
                            <div className="flex items-center gap-6 pb-2">
                                <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center font-black text-4xl text-blue-500">
                                    {proposal.user.nama?.[0]}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black">{proposal.user.nama}</h4>
                                    <p className="text-blue-200 opacity-60 font-medium uppercase text-xs tracking-widest mt-1">{proposal.user.jabatan} • {proposal.user.unit_kerja}</p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Status & Action */}
                <div className="sticky top-12 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 leading-none">Status Verifikasi</p>

                        <div className="mb-10">
                            {proposal.status === 'disetujui' ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                    <CheckCircle2 className="h-20 w-20 text-green-500 mb-4 drop-shadow-xl" />
                                    <h3 className="text-2xl font-black text-green-700 uppercase tracking-tight">DISETUJUI</h3>
                                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">Terverifikasi Sistem SI-SOTO</p>
                                </div>
                            ) : proposal.status === 'ditolak' ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                    <XCircle className="h-20 w-20 text-red-500 mb-4 drop-shadow-xl" />
                                    <h3 className="text-2xl font-black text-red-700 uppercase tracking-tight">DITOLAK</h3>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Gagal Verifikasi Dokumen</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Clock className="h-20 w-20 text-blue-500 mb-4 animate-pulse drop-shadow-xl" />
                                    <h3 className="text-2xl font-black text-blue-700 uppercase tracking-tight">DIAJUKAN</h3>
                                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">Menunggu Review Admin</p>
                                </div>
                            )}
                        </div>

                        {isAdmin && proposal.status === 'diajukan' && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => handleAction('approve')}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    SETUJUI BERKAS
                                </button>
                                <button
                                    onClick={() => handleAction('reject')}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                    TOLAK USULAN
                                </button>
                            </div>
                        )}

                        {proposal.status === 'disetujui' && (
                            <div className="pt-8 border-t border-slate-100 space-y-4">
                                <a
                                    href={`/api/sertifikat/${proposal.id}/download`}
                                    className="flex items-center gap-2 justify-center w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    <Download className="h-4 w-4" /> UNDUH SERTIFIKAT
                                </a>
                                <p className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">Sertifikat ID: {proposal.id.toString(36).toUpperCase()}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
