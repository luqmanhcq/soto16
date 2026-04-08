'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Search,
    Loader2,
    BarChart2,
    Settings,
    Eye,
    Star,
    Layers
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function AdminPembelajaranPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        fetchCourses()
    }, [user])

    async function fetchCourses() {
        try {
            const res = await fetch('/api/pembelajaran')
            const data = await res.json()
            if (res.ok) setCourses(data.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Yakin ingin menghapus kurikulum ini?')) return
        try {
            const res = await fetch(`/api/pembelajaran/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setCourses(courses.filter(c => c.id !== id))
            }
        } catch (err) {
            alert('Gagal menghapus pembelajaran')
        }
    }

    const filtered = courses.filter(c =>
        c.nama.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-8 lg:p-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Katalog <span className="text-emerald-600">E-Learning.</span></h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Kurikulum: {courses.length} Modul</p>
                </div>
                <Link
                    href="/admin/pembelajaran/create"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 leading-none"
                >
                    <Plus className="h-5 w-5" /> TAMBAH KURIKULUM
                </Link>
            </header>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
                        <Search className="h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul kurikulum..."
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
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Kurikulum</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Struktur</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Manajemen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group text-slate-900">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border-2 border-white group-hover:rotate-6 transition-transform">
                                                    <BookOpen className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase leading-none">{course.nama}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 italic">SLUG: {course.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white rounded-lg px-3 py-1 text-[10px] font-black lowercase tracking-tighter italic">
                                                <Layers className="h-3 w-3 text-emerald-400" /> {course.materials_count || 12} MATERI
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-slate-700 flex items-center gap-2">
                                                <Settings className="h-3 w-3 text-emerald-400" /> {course.kategori || 'Inti Kompetensi'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/pembelajaran/${course.id}`}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    href={`/admin/pembelajaran/${course.id}/edit`}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
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
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black uppercase italic">Katalog kurikulum belum terdaftar</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
