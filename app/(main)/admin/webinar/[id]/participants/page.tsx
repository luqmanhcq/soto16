'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Users,
    Download,
    ArrowLeft,
    Search,
    Loader2,
    Building2,
    Briefcase,
    BadgeCheck
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'

export default function WebinarParticipantsPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const webinarId = params.id

    const [participants, setParticipants] = useState<any[]>([])
    const [webinar, setWebinar] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        if (webinarId) {
            fetchData()
        }
    }, [user, webinarId])

    const fetchData = async () => {
        try {
            setLoading(true)
            // Fetch webinar info
            const webinarRes = await fetch(`/api/webinar/${webinarId}`)
            const webinarData = await webinarRes.json()
            if (webinarRes.ok) {
                setWebinar(webinarData.data)
            }

            // Fetch participants
            const pRes = await fetch(`/api/webinar/${webinarId}/participants`)
            const pData = await pRes.json()
            if (pRes.ok) {
                setParticipants(pData.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredParticipants = participants.filter(p =>
        p.nama.toLowerCase().includes(search.toLowerCase()) ||
        p.nip.toLowerCase().includes(search.toLowerCase())
    )

    const handleDownload = () => {
        window.open(`/api/webinar/${webinarId}/participants/download`, '_blank')
    }

    return (
        <div className="p-8 lg:p-12 space-y-10">
            {/* Header section with back button and title */}
            <div className="flex flex-col gap-6">
                <Link
                    href="/admin/webinar"
                    className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:gap-4 transition-all"
                >
                    <ArrowLeft className="h-4 w-4" /> KEMBALI KE MANAJEMEN WEBINAR
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            Daftar Peserta Terdaftar
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                            {loading ? 'Memuat...' : webinar?.nama_webinar || 'Detail Peserta'}
                        </h1>
                        <div className="flex items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-indigo-500" /> {participants.length || 0} Terdaftar</span>
                            <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-indigo-500" /> {webinar?.kategori || '-'}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={loading || participants.length === 0}
                        className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95 leading-none"
                    >
                        <Download className="h-5 w-5" /> EXPORT EXCEL (.xlsx)
                    </button>
                </div>
            </div>

            {/* Main Content Table Area */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <Search className="h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari Peserta (Nama / NIP)..."
                            className="flex-1 bg-transparent outline-none font-bold text-slate-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[60px]">No</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Peserta</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jabatan & Unit Kerja</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tgl. Terdaftar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
                                        <p className="font-bold uppercase tracking-widest text-xs">Memuat data peserta...</p>
                                    </td>
                                </tr>
                            ) : filteredParticipants.length > 0 ? (
                                filteredParticipants.map((p, index) => (
                                    <tr key={index} className="hover:bg-slate-50/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-slate-300 tabular-nums">{(index + 1).toString().padStart(2, '0')}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-900 uppercase leading-none group-hover:text-indigo-600 transition-colors">
                                                    {p.nama}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    NIP: {p.nip}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                                    <Briefcase className="h-3 w-3 text-indigo-400" />
                                                    {p.jabatan || 'Staf'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                    <Building2 className="h-3 w-3 text-indigo-400" />
                                                    {p.unit_kerja || 'Provinsi'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">
                                                {new Date(p.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center text-slate-300 font-black uppercase italic tracking-widest">
                                        Belum ada peserta yang terdaftar untuk webinar ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
