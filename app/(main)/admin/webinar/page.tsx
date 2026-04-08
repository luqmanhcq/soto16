'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Video,
    Plus,
    Edit,
    Trash2,
    Search,
    Loader2,
    MoreHorizontal,
    ExternalLink,
    Calendar,
    Users
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function AdminWebinarPage() {
    const [webinars, setWebinars] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [participantsCount, setParticipantsCount] = useState<Record<number, number>>({})
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        fetchWebinars()
    }, [user])

    async function fetchWebinars() {
        try {
            const res = await fetch('/api/webinar')
            const data = await res.json()
            if (res.ok) {
                setWebinars(data.data || [])
                // Fetch participants count for each webinar
                const counts: Record<number, number> = {}
                for (const webinar of data.data || []) {
                    try {
                        const res = await fetch(`/api/webinar/${webinar.id}/participants`)
                        const participantsData = await res.json()
                        if (res.ok) {
                            counts[webinar.id] = participantsData.data.length
                        }
                    } catch (err) {
                        console.error(`Failed to fetch participants for webinar ${webinar.id}:`, err)
                    }
                }
                setParticipantsCount(counts)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Yakin ingin menghapus webinar ini?')) return
        try {
            const res = await fetch(`/api/webinar/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setWebinars(webinars.filter(w => w.id !== id))
            }
        } catch (err) {
            alert('Gagal menghapus webinar')
        }
    }

    const filtered = webinars.filter(w =>
        w.nama_webinar.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-8 lg:p-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Manajemen <span className="text-indigo-600">Webinar.</span></h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Konten: {webinars.length} Aktivitas</p>
                </div>
                <Link
                    href="/webinar/create"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 leading-none"
                >
                    <Plus className="h-5 w-5" /> TAMBAH WEBINAR
                </Link>
            </header>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <Search className="h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul atau kategori..."
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
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Konten Webinar</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jadwal & Kuota</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Peserta</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((webinar) => (
                                    <tr key={webinar.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                                                    <Video className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-none">{webinar.nama_webinar}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{webinar.kategori}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-slate-700 flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-indigo-400" /> {new Date(webinar.tanggal_mulai).toLocaleDateString('id-ID')}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-tighter">
                                                    <Users className="h-3 w-3 text-indigo-400" /> Kuota: {webinar.kuota || 'UNLIMITED'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter italic ${webinar.jenis_webinar === 'internal' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {(webinar.jenis_webinar || 'external').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter italic ${webinar.status === 'publish' ? 'bg-emerald-50 text-emerald-600' :
                                                    webinar.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {webinar.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700">{participantsCount[webinar.id] || 0}</span>
                                                <Link
                                                    href={`/admin/webinar/${webinar.id}/participants`}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Lihat Daftar Peserta"
                                                >
                                                    <Users className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/webinar/${webinar.id}/edit`}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(webinar.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-black uppercase italic">Data tidak ditemukan</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
