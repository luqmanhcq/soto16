'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Link as LinkIcon, Image as ImageIcon, Calendar, Type, Upload, X } from 'lucide-react'
import Link from 'next/link'

interface Narasumber {
    nama: string
    jabatan: string
    instansi: string
}

interface WebinarFormProps {
    id?: string
    initialData?: any
}

export default function WebinarForm({ id, initialData }: WebinarFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nama_webinar: '',
        slug: '',
        kategori: '',
        deskripsi: '',
        narasumber: '',
        jumlah_jp: 2,
        nilai_min: 70,
        tanggal_mulai: '',
        tanggal_selesai: '',
        kuota: 100,
        penyelenggara: '',
        jenis_webinar: 'external',
        link_daftar: '',
        link_zoom: '',
        link_youtube: '',
        link_materi: '',
        link_post_test: '',
        link_monev: '',
        link_sertifikat: '',
        gambar: '',
        status: 'draft'
    })

    const [narasumberList, setNarasumberList] = useState<Narasumber[]>([{ nama: '', jabatan: '', instansi: '' }])

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                jenis_webinar: initialData.jenis_webinar || 'external',
            })
            if (initialData.narasumber) {
                // Gunakan JSON jika memungkinkan (Clean Code & Best Practice)
                // Fallback splitting untuk data lama yang masih pakai string separator
                try {
                    const parsed = JSON.parse(initialData.narasumber)
                    if (Array.isArray(parsed)) {
                        setNarasumberList(parsed)
                    } else {
                        throw new Error('Not an array')
                    }
                } catch (error) {
                    // Jika gagal parse JSON, anggap itu data lama (string sederhana)
                    if (initialData.narasumber.includes('###')) {
                        setNarasumberList(initialData.narasumber.split('###').map((n: string) => ({ nama: n, jabatan: '', instansi: '' })))
                    } else {
                        setNarasumberList(initialData.narasumber.split(', ').map((n: string) => ({ nama: n, jabatan: '', instansi: '' })))
                    }
                }
            }
        }
    }, [initialData])

    // Auto-generate slug from nama_webinar
    useEffect(() => {
        if (!id) { // Only auto-generate for new records to avoid breaking old links
            const slug = formData.nama_webinar
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')

            setFormData(prev => ({ ...prev, slug }))
        }
    }, [formData.nama_webinar, id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
            ...(name === 'jenis_webinar' && value === 'internal' ? { link_daftar: '' } : {}),
        }))
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

    const handleAddNarasumber = () => {
        setNarasumberList(prev => [...prev, { nama: '', jabatan: '', instansi: '' }])
    }

    const handleRemoveNarasumber = (index: number) => {
        setNarasumberList(prev => prev.filter((_, i) => i !== index))
    }

    const handleNarasumberChange = (index: number, field: keyof Narasumber, value: string) => {
        const newList = [...narasumberList]
        newList[index] = { ...newList[index], [field]: value }
        setNarasumberList(newList)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const finalData = {
                ...formData,
                narasumber: JSON.stringify(narasumberList.filter(n => n.nama.trim() !== ''))
            }

            const url = id ? `/api/webinar/${id}` : '/api/webinar'
            const method = id ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            })

            if (res.ok) {
                alert(`Webinar berhasil ${id ? 'diupdate' : 'dibuat'}!`)
                router.push('/admin/webinar')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.message || 'Gagal menyimpan webinar')
            }
        } catch (error) {
            console.error('Failed to submit webinar', error)
            alert('Terjadi kesalahan sistem')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 lg:p-12 max-w-5xl mx-auto">
            <Link
                href="/webinar"
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold mb-6 transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
                Kembali ke Katalog
            </Link>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 text-slate-900">
                <header className="flex items-center gap-4 mb-4">
                    <div className={`p-4 rounded-2xl ${id ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Type className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{id ? 'Sunting' : 'Tambah'} Webinar</h2>
                        <p className="text-slate-400 text-sm">Lengkapi detail informasi kegiatan di bawah ini.</p>
                    </div>
                </header>

                <section className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nama Webinar</label>
                        <input
                            name="nama_webinar"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                            placeholder="Masukkan nama webinar..."
                            value={formData.nama_webinar}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Slug (URL)</label>
                        <input
                            name="slug"
                            readOnly
                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 outline-none font-medium text-slate-500 cursor-not-allowed italic"
                            placeholder="otomatis-terisi-dari-judul"
                            value={formData.slug}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                        <select
                            name="kategori"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                            value={formData.kategori}
                            onChange={handleChange}
                        >
                            <option value="">Pilih Kategori</option>
                            <option value="KEPEMIMPINAN">Kepemimpinan</option>
                            <option value="TEKNIS">Teknis</option>
                            <option value="MANAJERIAL">Manajerial</option>
                            <option value="SOSIOKULTURAL">Sosiokultural</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2 italic">Visual Banner / Poster Webinar (Upload)</label>
                        <div className="relative group/banner border-2 border-dashed border-slate-200 rounded-3xl p-4 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-center">
                            {formData.gambar ? (
                                <div className="relative">
                                    <img
                                        src={formData.gambar}
                                        alt="Banner Preview"
                                        className="w-full h-56 object-cover rounded-2xl shadow-md border-4 border-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, gambar: '' }))}
                                        className="absolute -top-2 -right-2 h-8 w-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center py-10 cursor-pointer">
                                    <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover/banner:scale-110 group-hover/banner:text-blue-600 transition-all">
                                        <Upload className="h-8 w-8" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 mt-4 uppercase tracking-widest">Pilih Gambar atau Drop File</span>
                                    <span className="text-[10px] text-slate-300 mt-1 uppercase">PNG, JPG up to 1MB (Full width)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Webinar</label>
                        <textarea
                            name="deskripsi"
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                            placeholder="Jelaskan mengenai webinar ini..."
                            value={formData.deskripsi}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-slate-700">Daftar Narasumber</label>
                            <button
                                type="button"
                                onClick={handleAddNarasumber}
                                className="flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                                + Tambah Narasumber
                            </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {narasumberList.map((nara, idx) => (
                                <div key={idx} className="relative group/nara bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap & Gelar</label>
                                            <input
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                                                placeholder="Dr. Jan Gorm Lisby, MD..."
                                                value={nara.nama}
                                                onChange={(e) => handleNarasumberChange(idx, 'nama', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jabatan</label>
                                                <input
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
                                                    placeholder="Contoh: Direktur Pelayanan..."
                                                    value={nara.jabatan}
                                                    onChange={(e) => handleNarasumberChange(idx, 'jabatan', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Instansi / Asal</label>
                                                <input
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
                                                    placeholder="Contoh: RS. Indonesia..."
                                                    value={nara.instansi}
                                                    onChange={(e) => handleNarasumberChange(idx, 'instansi', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {narasumberList.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNarasumber(idx)}
                                            className="absolute -top-2 -right-2 h-8 w-8 bg-red-50 text-red-600 rounded-full border border-red-100 flex items-center justify-center opacity-0 group-hover/nara:opacity-100 shadow-sm transition-all hover:bg-red-600 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Penyelenggara</label>
                            <input
                                name="penyelenggara"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                placeholder="Instansi penyelenggara..."
                                value={formData.penyelenggara}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Webinar</label>
                            <select
                                name="jenis_webinar"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                value={formData.jenis_webinar}
                                onChange={handleChange}
                            >
                                <option value="external">External</option>
                                <option value="internal">Internal</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Mulai</label>
                        <input
                            name="tanggal_mulai"
                            type="date"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                            value={formData.tanggal_mulai}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Selesai</label>
                        <input
                            name="tanggal_selesai"
                            type="date"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                            value={formData.tanggal_selesai}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Jumlah JP</label>
                        <input
                            name="jumlah_jp"
                            type="number"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                            value={formData.jumlah_jp}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Kuota Peserta</label>
                        <input
                            name="kuota"
                            type="number"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                            value={formData.kuota}
                            onChange={handleChange}
                        />
                    </div>
                </section>

                <section className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-blue-600" />
                        Koleksi Link Eksternal
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        {formData.jenis_webinar === 'external' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Link Pendaftaran</label>
                                <input
                                    name="link_daftar"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                    placeholder="https://..."
                                    value={formData.link_daftar}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Link Zoom Meeting</label>
                            <input
                                name="link_zoom"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                placeholder="https://zoom.us/..."
                                value={formData.link_zoom}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Link Materi</label>
                            <input
                                name="link_materi"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                placeholder="https://drive.google.com/..."
                                value={formData.link_materi}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Link Post Test / Tugas</label>
                            <input
                                name="link_post_test"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                placeholder="https://google.forms/..."
                                value={formData.link_post_test}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Link Monev</label>
                            <input
                                name="link_monev"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                placeholder="https://..."
                                value={formData.link_monev}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Link Sertifikat Eksternal</label>
                            <input
                                name="link_sertifikat"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                placeholder="https://..."
                                value={formData.link_sertifikat}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                <section className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                            <div className="flex items-center gap-4">
                                {['draft', 'publish', 'selesai'].map(s => (
                                    <label key={s} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="status"
                                            value={s}
                                            checked={formData.status === s}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 bg-slate-50"
                                        />
                                        <span className={`text-sm font-semibold capitalize ${formData.status === s ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`}>{s}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 ${id ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {id ? 'Simpan Perubahan' : 'Buat Webinar'}
                    </button>
                </section>
            </form>
        </div>
    )
}
