'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Bell,
    Plus,
    Edit,
    Trash2,
    Search,
    Loader2,
    Calendar,
    FileText,
    AlertCircle
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function AdminPengumumanPage() {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        fetchAnnouncements()
    }, [user])

    async function fetchAnnouncements() {
        try {
            const res = await fetch('/api/pengumuman')
            const data = await res.json()
            if (res.ok) setAnnouncements(data.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Yakin ingin menghapus pengumuman ini?')) return
        try {
            const res = await fetch(`/api/pengumuman/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setAnnouncements(announcements.filter(a => a.id !== id))
            }
        } catch (err) {
            alert('Gagal menghapus pengumuman')
        }
    }

    const filtered = announcements.filter(a =>
        a.judul.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-8 lg:p-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Manajemen <span className="text-amber-600">Pengumuman.</span></h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Rilis: {announcements.length} Informasi</p>
                </div>
                <Link
                    href="/admin/pengumuman/create"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-amber-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95 leading-none"
                >
                    <Plus className="h-5 w-5" /> BUAT PENGUMUMAN
                </Link>
            </header>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-50 transition-all">
                        <Search className="h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari pengumuman..."
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
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul & Detail Berita</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Rilis</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center">
                                        <Loader2 className="h-8 w-8 text-amber-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group text-slate-900">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold group-hover:bg-amber-600 group-hover:text-white transition-all">
                                                    <Bell className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 group-hover:text-amber-700 transition-colors uppercase leading-none">{item.judul}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 line-clamp-1 italic">{item.deskripsi}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-slate-700 flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-amber-400" /> {new Date(item.created_at).toLocaleDateString('id-ID')}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/pengumuman/${item.id}/edit`}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center text-slate-300 font-black uppercase italic">Belum ada pengumuman yang dirilis hari ini</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
