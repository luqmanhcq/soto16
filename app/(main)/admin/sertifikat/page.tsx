'use client'

import React, { useState, useEffect } from 'react'
import {
    FileCheck,
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar,
    ExternalLink,
    Filter,
    Download,
    MoreVertical
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import FullPageLoader from '@/components/FullPageLoader'

export default function AdminSertifikatPage() {
    const [proposals, setProposals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        fetchProposals()
    }, [user])

    async function fetchProposals() {
        try {
            const res = await fetch('/api/sertifikat') // Potentially need an admin-specific endpoint or handle roles in current one
            const data = await res.json()
            if (res.ok) setProposals(data.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleAction(id: number, status: 'disetujui' | 'ditolak') {
        if (!confirm(`Konfirmasi untuk ${status} usulan ini?`)) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/sertifikat/${id}/approval`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                setProposals(proposals.map(p => p.id === id ? { ...p, status } : p))
            }
        } catch (err) {
            alert('Gagal melakukan aksi approval')
        } finally {
            setActionLoading(false)
        }
    }

    const filtered = proposals.filter(p => {
        const matchSearch = p.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) ||
            p.user?.nama?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || p.status === filterStatus
        return matchSearch && matchStatus
    })

    return (
        <div className="p-8 lg:p-12 space-y-10">
            {actionLoading && <FullPageLoader message="Otorisasi Berkas..." subMessage="Update Status Sertifikasi ASN" />}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Pusat Verifikasi <span className="text-blue-600">Sertifikat.</span></h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Menunggu Persetujuan: {proposals.filter(p => p.status === 'diajukan').length} Usulan</p>
                </div>
            </header>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row items-center gap-6">
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all w-full">
                        <Search className="h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari usulan berdasarkan nama ASN atau kegiatan..."
                            className="flex-1 bg-transparent outline-none font-bold text-slate-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'diajukan', 'disetujui', 'ditolak'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Usulan & ASN</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Berkas</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Approval</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6 text-left">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-inner">
                                                    <User className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-none">{item.user?.nama}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 line-clamp-1 italic">{item.nama_kegiatan}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button className="h-10 w-10 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-md active:scale-90 inline-flex">
                                                <Download className="h-5 w-5" />
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {item.status === 'diajukan' ? <Clock className="h-4 w-4 text-amber-500 animate-pulse" /> :
                                                    item.status === 'disetujui' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                                <span className={`text-[10px] font-black uppercase tracking-tighter italic ${item.status === 'disetujui' ? 'text-emerald-600' :
                                                        item.status === 'diajukan' ? 'text-amber-600' : 'text-red-600'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {item.status === 'diajukan' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAction(item.id, 'disetujui')}
                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                                                    >
                                                        APPROVE
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(item.id, 'ditolak')}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95"
                                                    >
                                                        REJECT
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">TIDAK ADA AKSI</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black uppercase italic">Tidak ada usulan sertifikat yang sedang ditinjau</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
