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
    Eye,
    Layers,
    LayoutList
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function AdminManajemenPengetahuanPage() {
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
            const res = await fetch('/api/manajemen-pengetahuan')
            const data = await res.json()
            if (res.ok) setCourses(data.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Yakin ingin menghapus program ini?')) return
        try {
            const res = await fetch(`/api/manajemen-pengetahuan/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setCourses(courses.filter(c => c.id !== id))
            }
        } catch (err) {
            alert('Gagal menghapus manajemen pengetahuan')
        }
    }

    const filtered = courses.filter(c =>
        c.nama.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Manajemen Pengetahuan</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">{courses.length} program • kelola materi & publikasi</p>
                </div>
                <Link
                    href="/admin/manajemen-pengetahuan/create"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                    <Plus className="h-4 w-4" /> Tambah Program
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                        <Search className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari judul program..."
                            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mx-auto" />
                        <p className="mt-2 text-xs text-slate-400">Memuat...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <>
                        {/* Mobile cards */}
                        <div className="grid gap-3 p-3 sm:hidden">
                            {filtered.map((course) => (
                                <div key={course.id} className="rounded-xl border border-slate-200 p-3 flex gap-3 hover:border-indigo-200 hover:shadow-sm transition-all">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">{course.nama}</p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold"><Layers className="h-3 w-3" /> {course.materials_count ?? 0} materi</span>
                                            <span className="truncate">{course.kategori || 'Umum'}</span>
                                        </p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <Link href={`/admin/manajemen-pengetahuan/${course.id}`} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"><LayoutList className="h-4 w-4" /></Link>
                                            <Link href={`/manajemen-pengetahuan/${course.slug}`} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"><Eye className="h-4 w-4" /></Link>
                                            <Link href={`/admin/manajemen-pengetahuan/${course.id}/edit`} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"><Edit className="h-4 w-4" /></Link>
                                            <button onClick={() => handleDelete(course.id)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-y border-slate-100">
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Program</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-center">Materi</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Kategori</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((course) => (
                                        <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 truncate max-w-[260px]">{course.nama}</p>
                                                        <p className="text-xs text-slate-400 truncate">/{course.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
                                                    <Layers className="h-3 w-3" /> {course.materials_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{course.kategori || 'Umum'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/admin/manajemen-pengetahuan/${course.id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600" title="Kelola materi"><LayoutList className="h-4 w-4" /></Link>
                                                    <Link href={`/manajemen-pengetahuan/${course.slug}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600" title="Lihat"><Eye className="h-4 w-4" /></Link>
                                                    <Link href={`/admin/manajemen-pengetahuan/${course.id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600" title="Edit"><Edit className="h-4 w-4" /></Link>
                                                    <button onClick={() => handleDelete(course.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center">
                        <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
                        <p className="mt-2 text-sm font-semibold text-slate-600">Belum ada program</p>
                        <p className="text-xs text-slate-400">Tambah program pertama untuk memulai.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
