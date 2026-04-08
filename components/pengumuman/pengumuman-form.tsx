'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Type, Bell, Link as LinkIcon, FileText, Upload, X } from 'lucide-react'
import Link from 'next/link'
import FullPageLoader from '@/components/FullPageLoader'

interface PengumumanFormProps {
    id?: string
    initialData?: any
}

export default function PengumumanForm({ id, initialData }: PengumumanFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        judul: '',
        slug: '',
        deskripsi: '',
        gambar: '',
        link_file: ''
    })

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

    // Auto-generate slug from judul
    useEffect(() => {
        if (!id) {
            const slug = formData.judul
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')
            setFormData(prev => ({ ...prev, slug }))
        }
    }, [formData.judul, id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const uploadData = new FormData()
        uploadData.append('file', file)

        setLoading(true)
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            })
            const data = await res.json()
            if (res.ok) {
                setFormData(prev => ({ ...prev, gambar: data.url }))
            } else {
                alert(data.message || 'Gagal mengunggah gambar')
            }
        } catch (error) {
            console.error('Upload Error:', error)
            alert('Kesalahan jaringan saat mengunggah')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = id ? `/api/pengumuman/${id}` : '/api/pengumuman'
            const method = id ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                alert('Pengumuman berhasil disimpan!')
                router.push('/admin/pengumuman')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.message || 'Gagal menyimpan pengumuman')
            }
        } catch (error) {
            console.error('Failed to submit pengumuman', error)
            alert('Terjadi kesalahan sistem')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 lg:p-12 max-w-4xl mx-auto">
            {loading && <FullPageLoader message="Broadcast Informasi..." subMessage="Update Pengumuman Platform" />}
            <Link
                href="/admin/pengumuman"
                className="flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold mb-8 transition-all"
            >
                <ArrowLeft className="h-5 w-5" />
                Batal & Kembali
            </Link>

            <form onSubmit={handleSubmit} className="bg-white p-10 lg:p-14 rounded-[3.5rem] shadow-2xl shadow-amber-100/50 border border-slate-100 text-slate-900">
                <header className="mb-12 flex items-center gap-6">
                    <div className="p-5 rounded-3xl bg-amber-50 text-amber-600">
                        <Bell className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{id ? 'Sunting' : 'Terbitkan'} Pengumuman</h2>
                        <p className="text-slate-400 font-bold italic text-sm mt-1 tracking-tight uppercase leading-none">Berbagikan Informasi Terkini Kepada ASN SI-SOTO.</p>
                    </div>
                </header>

                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Judul Pengumuman</label>
                            <input
                                name="judul"
                                required
                                placeholder="Judul Pengumuman Penting..."
                                className="w-full bg-slate-50 rounded-2xl px-6 py-5 outline-none border border-slate-100 focus:border-amber-500 focus:bg-white transition-all text-xl font-black text-slate-900 placeholder:text-slate-300"
                                value={formData.judul}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Slug URL Bersih</label>
                            <input
                                name="slug"
                                readOnly
                                placeholder="pengumuman-judul-terbaru"
                                className="w-full bg-slate-100 rounded-2xl px-6 py-4 outline-none border border-slate-200 font-bold text-slate-400 cursor-not-allowed italic"
                                value={formData.slug}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Isi Detail Pengumuman</label>
                            <textarea
                                name="deskripsi"
                                rows={6}
                                placeholder="Tuliskan isi pengumuman secara detail di sini..."
                                className="w-full bg-slate-50 rounded-2xl px-6 py-5 outline-none border border-slate-100 focus:border-amber-500 focus:bg-white transition-all font-bold text-slate-900 leading-relaxed"
                                value={formData.deskripsi}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Gambar Sampul Pengumuman (Upload)</label>
                            <div className="relative group/banner border-2 border-dashed border-slate-200 rounded-3xl p-4 bg-slate-50 hover:bg-slate-100 transition-all text-center">
                                {formData.gambar ? (
                                    <div className="relative">
                                        <img src={formData.gambar} alt="Preview" className="w-full h-40 object-cover rounded-2xl shadow-md border-4 border-white" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, gambar: '' }))}
                                            className="absolute -top-2 -right-2 h-8 w-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                                        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover/banner:text-amber-600 transition-all">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-black text-slate-400 mt-4 uppercase tracking-widest">Pilih Gambar Sampul</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Link File Lampiran</label>
                            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl border border-slate-100 px-6 py-4 focus-within:border-amber-500 transition-all">
                                <LinkIcon className="h-5 w-5 text-slate-300" />
                                <input
                                    name="link_file"
                                    placeholder="https://link-file-pdf.com"
                                    className="flex-1 bg-transparent outline-none font-bold text-slate-900 text-sm"
                                    value={formData.link_file}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-4 px-12 py-5 bg-amber-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-amber-200 hover:bg-amber-700 active:scale-95 transition-all disabled:opacity-50 leading-none"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                            {id ? 'SIMPAN PERUBAHAN' : 'RILIS PENGUMUMAN'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
