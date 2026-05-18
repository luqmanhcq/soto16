'use client'

import React, { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    Plus,
    Edit,
    Trash2,
    Search,
    Loader2,
    Image as ImageIcon,
    Link as LinkIcon,
    ChevronUp,
    ChevronDown,
    Save,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function AdminCarouselPage() {
    const [carousels, setCarousels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCarousel, setEditingCarousel] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        cta_text: 'Lihat Detail',
        is_active: true,
        order: 0
    })

    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        fetchCarousels()
    }, [user])

    async function fetchCarousels() {
        try {
            setLoading(true)
            const res = await fetch('/api/carousel')
            const data = await res.json()
            if (res.ok) {
                setCarousels(data.data || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const openModal = (carousel: any = null) => {
        if (carousel) {
            setEditingCarousel(carousel)
            setFormData({
                title: carousel.title,
                subtitle: carousel.subtitle || '',
                image: carousel.image,
                link: carousel.link || '',
                cta_text: carousel.cta_text || 'Lihat Detail',
                is_active: carousel.is_active,
                order: carousel.order
            })
        } else {
            setEditingCarousel(null)
            setFormData({
                title: '',
                subtitle: '',
                image: '',
                link: '',
                cta_text: 'Lihat Detail',
                is_active: true,
                order: carousels.length
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingCarousel(null)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const data = new FormData()
            data.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            })
            const result = await res.json()

            if (res.ok) {
                setFormData({ ...formData, image: result.url })
            } else {
                alert(result.message || 'Gagal mengunggah gambar')
            }
        } catch (err) {
            alert('Terjadi kesalahan saat mengunggah gambar')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            const url = editingCarousel 
                ? `/api/carousel/${editingCarousel.id}` 
                : '/api/carousel'
            const method = editingCarousel ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                fetchCarousels()
                closeModal()
            } else {
                const data = await res.json()
                alert(data.message || 'Gagal menyimpan carousel')
            }
        } catch (err) {
            alert('Terjadi kesalahan sistem')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Yakin ingin menghapus carousel ini?')) return
        try {
            const res = await fetch(`/api/carousel/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setCarousels(carousels.filter(c => c.id !== id))
            }
        } catch (err) {
            alert('Gagal menghapus carousel')
        }
    }

    const filtered = carousels.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-8 lg:p-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Manajemen <span className="text-amber-500">Carousel.</span></h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Slide: {carousels.length} Item</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95 leading-none"
                >
                    <Plus className="h-5 w-5" /> TAMBAH SLIDE
                </button>
            </header>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-50 transition-all">
                        <Search className="h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul..."
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
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Konten</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Urutan</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((carousel) => (
                                    <tr key={carousel.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="h-16 w-28 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                                                <img src={carousel.image} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase leading-tight">{carousel.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 italic">{carousel.subtitle || 'Tidak ada keterangan'}</p>
                                                {carousel.link && (
                                                    <p className="text-[9px] font-bold text-indigo-400 flex items-center gap-1">
                                                        <LinkIcon className="h-2 w-2" /> {carousel.link}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                                                    {carousel.order}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter italic ${carousel.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {carousel.is_active ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(carousel)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(carousel.id)}
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
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-black uppercase italic">Data tidak ditemukan</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{editingCarousel ? 'Edit' : 'Tambah'} <span className="text-amber-500">Slide.</span></h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Pastikan dimensi gambar proporsional (16:9)</p>
                            </div>
                            <button onClick={closeModal} className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all"><X className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3 col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Judul Utama</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-50 focus:bg-white transition-all font-bold text-slate-700"
                                        placeholder="Contoh: SI-SOTO LAMONGAN"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3 col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Keterangan / Subtitle</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-50 focus:bg-white transition-all font-bold text-slate-700"
                                        placeholder="Deskripsi singkat yang muncul di bawah judul"
                                        value={formData.subtitle}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Text Tombol (CTA)</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-50 focus:bg-white transition-all font-bold text-slate-700"
                                        placeholder="Mulai Sekarang"
                                        value={formData.cta_text}
                                        onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Link Tujuan</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-50 focus:bg-white transition-all font-bold text-slate-700"
                                        placeholder="/webinar atau https://..."
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3 col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gambar Background</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-400 text-xs"
                                                readOnly
                                                placeholder="Pilih file atau masukkan URL..."
                                                value={formData.image}
                                            />
                                        </div>
                                        <label className="cursor-pointer px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all">
                                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'UPLOAD'}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    {formData.image && (
                                        <div className="mt-4 h-32 w-full rounded-2xl overflow-hidden border border-slate-100 relative group">
                                            <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, image: ''})}
                                                className="absolute top-2 right-2 h-8 w-8 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Urutan Tampil</label>
                                    <input
                                        type="number"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-50 focus:bg-white transition-all font-bold text-slate-700"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-center gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`h-12 w-20 rounded-2xl flex items-center p-1 transition-all ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`h-10 w-10 bg-white rounded-xl shadow-lg transform transition-transform ${formData.is_active ? 'translate-x-8' : 'translate-x-0'}`} />
                                    </button>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: {formData.is_active ? 'AKTIF' : 'NONAKTIF'}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={submitting || !formData.image}
                                    className="flex-1 py-5 bg-amber-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
                                >
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} SIMPAN PERUBAHAN
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-10 py-5 bg-slate-50 text-slate-400 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all"
                                >
                                    BATAL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
