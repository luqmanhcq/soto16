'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Type, LayoutDashboard, Globe, FileImage, Upload, X } from 'lucide-react'
import Link from 'next/link'
import FullPageLoader from '@/components/FullPageLoader'

interface PembelajaranFormProps {
    id?: string
    initialData?: any
}

export default function PembelajaranForm({ id, initialData }: PembelajaranFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nama_pembelajaran: '',
        slug: '',
        kategori: '',
        deskripsi: '',
        gambar: '',
        status: 'draft'
    })

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

    // Auto-generate slug from nama_pembelajaran
    useEffect(() => {
        if (!id) {
            const slug = formData.nama_pembelajaran
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')
            setFormData(prev => ({ ...prev, slug }))
        }
    }, [formData.nama_pembelajaran, id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            const url = id ? `/api/pembelajaran/${id}` : '/api/pembelajaran'
            const method = id ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                alert('Data pembelajaran berhasil disimpan!')
                router.push('/pembelajaran')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.message || 'Gagal menyimpan data')
            }
        } catch (error) {
            console.error('Failed to submit pembelajaran', error)
            alert('Terjadi kesalahan sistem')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 lg:p-12 max-w-4xl mx-auto">
            {loading && <FullPageLoader message="Memproses Modul..." subMessage="Menyusun Kurikulum Digital" />}
            <Link
                href="/pembelajaran"
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-all"
            >
                <ArrowLeft className="h-5 w-5" />
                Batal & Kembali
            </Link>

            <form onSubmit={handleSubmit} className="bg-white p-10 lg:p-14 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 text-slate-900">
                <header className="mb-12 flex items-center gap-6">
                    <div className={`p-5 rounded-3xl ${id ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        <LayoutDashboard className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{id ? 'Sunting' : 'Terbitkan'} Pembelajaran Baru</h2>
                        <p className="text-slate-400 font-semibold italic text-sm mt-1 tracking-tight">Kembangkan kurikulum pembelajaran mandiri untuk ASN SI-SOTO.</p>
                    </div>
                </header>

                <section className="space-y-10">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-black text-slate-700 tracking-widest uppercase">
                            <Type className="h-4 w-4 text-indigo-600" />
                            Identitas Utama
                        </label>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <input
                                    name="nama_pembelajaran"
                                    required
                                    placeholder="Judul Pembelajaran Mandiri..."
                                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-lg font-black text-slate-900 placeholder:text-slate-300"
                                    value={formData.nama_pembelajaran}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <input
                                    name="slug"
                                    readOnly
                                    placeholder="URL-SLUG (otomatis)"
                                    className="w-full bg-slate-100 rounded-2xl px-6 py-4 outline-none ring-1 ring-slate-200 font-bold text-slate-500 cursor-not-allowed italic"
                                    value={formData.slug}
                                />
                            </div>
                            <div>
                                <select
                                    name="kategori"
                                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-900"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                >
                                    <option value="">Kategori Kursus</option>
                                    <option value="KEPEMIMPINAN">Kepemimpinan</option>
                                    <option value="KEBIJAKAN">Kebijakan Publik</option>
                                    <option value="TEKNOLOGI">Teknologi Informasi</option>
                                    <option value="KREATIF">Kompetensi Kreatif</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-black text-slate-700 tracking-widest uppercase">
                            <Globe className="h-4 w-4 text-indigo-600" />
                            Konten & Metadata
                        </label>
                        <textarea
                            name="deskripsi"
                            rows={4}
                            placeholder="Deskripsi singkat mengenai apa yang akan dipelajari..."
                            className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-slate-900"
                            value={formData.deskripsi}
                            onChange={handleChange}
                        />
                        <div className="relative group/banner border-2 border-dashed border-slate-200 rounded-3xl p-4 bg-slate-50 hover:bg-slate-100 transition-all">
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
                                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover/banner:text-indigo-600 transition-all">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 mt-4 uppercase tracking-widest leading-none">Unggah Sampul Kursus</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-4">Status Penerbitan</label>
                            {['draft', 'publish'].map(s => (
                                <label key={s} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s}
                                        checked={formData.status === s}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 bg-slate-50"
                                    />
                                    <span className={`text-sm font-bold capitalize ${formData.status === s ? 'text-indigo-600 font-black' : 'text-slate-400 group-hover:text-slate-500'}`}>{s}</span>
                                </label>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                            {id ? 'SIMPAN PERUBAHAN' : 'TERBITKAN KURSUS'}
                        </button>
                    </div>
                </section>
            </form>
        </div>
    )
}
