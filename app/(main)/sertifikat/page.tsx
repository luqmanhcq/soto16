'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    Plus,
    FileCheck,
    Search,
    Filter,
    Download,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Clock,
    MoreVertical,
    Trash2,
    FileText
} from 'lucide-react'
import Link from 'next/link'

export default function SertifikatPage() {
    const [proposals, setProposals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { user } = useAuth()

    useEffect(() => {
        fetchProposals()
    }, [])

    const fetchProposals = async () => {
        try {
            const res = await fetch('/api/sertifikat')
            const data = await res.json()
            if (res.ok) setProposals(data.data)
        } catch (error) {
            console.error('Failed to fetch certificate proposals', error)
        } finally {
            setLoading(false)
        }
    }

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

    const filteredProposals = proposals.filter((p) =>
        p.nama_diklat.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'disetujui':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-black ring-1 ring-inset ring-green-600/20 uppercase tracking-tighter"><CheckCircle2 className="h-3 w-3" /> Disetujui</span>
            case 'ditolak':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-black ring-1 ring-inset ring-red-600/20 uppercase tracking-tighter"><XCircle className="h-3 w-3" /> Ditolak</span>
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black ring-1 ring-inset ring-blue-600/20 uppercase tracking-tighter"><Clock className="h-3 w-3" /> Diajukan</span>
        }
    }

    return (
        <div className="p-8 lg:p-12">
            <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Usulan Sertifikat</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manajemen sertifikasi eksternal untuk pemenuhan JP tahunan ASN.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari diklat..."
                            className="pl-10 pr-4 py-2.5 w-64 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {!isAdmin && (
                        <Link
                            href="/sertifikat/baru"
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            <Plus className="h-5 w-5" />
                            Buat Usulan
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Nama Diklat / Kegiatan</th>
                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Penyelenggara</th>
                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{isAdmin ? 'Pengusul' : 'Tgl Pelaksanaan'}</th>
                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Poin JP</th>
                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i} className="animate-pulse">
                                    {[1, 2, 3, 4, 5, 6].map(j => (
                                        <td key={j} className="px-8 py-5"><div className="h-4 bg-slate-100 rounded-lg w-full" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filteredProposals.length > 0 ? (
                            filteredProposals.map((proposal) => (
                                <tr key={proposal.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-slate-900 leading-snug">{proposal.nama_diklat}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">ID: #{proposal.id.toString().padStart(4, '0')}</p>
                                    </td>
                                    <td className="px-6 py-6 text-sm font-semibold text-slate-600 truncate max-w-[150px]">{proposal.penyelenggara}</td>
                                    <td className="px-6 py-6 text-sm font-semibold text-slate-600 leading-none">
                                        {isAdmin ? proposal.user?.nama : new Date(proposal.tanggal_pelaksanaan).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-6 font-black text-blue-600">{proposal.jumlah_jp} JP</td>
                                    <td className="px-6 py-6">{getStatusBadge(proposal.status)}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/sertifikat/${proposal.id}`}
                                                className="flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Lihat Detail / Review"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Link>
                                            {proposal.status === 'disetujui' && (
                                                <a
                                                    href={`/api/sertifikat/${proposal.id}/download`}
                                                    className="flex items-center justify-center p-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Unduh Sertifikat Terverifikasi"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">Belum ada usulan sertifikat ditemukan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
