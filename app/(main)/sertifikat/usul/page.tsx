'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Upload, FileDescription, Calendar, Users, Award, ShieldCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewProposalPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nama_diklat: '',
        tanggal_pelaksanaan: '',
        jumlah_jp: 2,
        penyelenggara: '',
        file_usulan: '' // In real app, this would be a file upload. Here we use a path or name.
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/sertifikat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                alert('Usulan sertifikat berhasil diajukan!')
                router.push('/sertifikat')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.message || 'Gagal mengajukan usulan')
            }
        } catch (error) {
            console.error('Failed to submit proposal', error)
            alert('Terjadi kesalahan sistem')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-10">
            <Link
                href="/sertifikat"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black transition-all mb-4 uppercase tracking-widest text-xs"
            >
                <ArrowLeft className="h-4 w-4" /> Batal & Kembali
            </Link>

            <section className="bg-white p-10 lg:p-14 rounded-[3.5rem] shadow-2xl shadow-blue-100/50 border border-slate-100">
                <header className="mb-12 flex items-center gap-6">
                    <div className="p-5 rounded-3xl bg-blue-50 text-blue-600 shadow-xl shadow-blue-500/10">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ajukan Usul Sertifikat</h1>
                        <p className="text-slate-400 font-bold italic text-sm mt-1 tracking-tight">Kirimkan bukti diklat eksternal untuk diverifikasi akumulasi poin JP.</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid gap-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Nama Diklat / Kegiatan</label>
                            <input
                                name="nama_diklat"
                                required
                                placeholder="Contoh: Pelatihan Dasar Cybersecurity ASN"
                                className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-lg font-bold"
                                value={formData.nama_diklat}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Tanggal Pelaksanaan</label>
                            <input
                                name="tanggal_pelaksanaan"
                                type="date"
                                required
                                className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-slate-600 uppercase"
                                value={formData.tanggal_pelaksanaan}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Jumlah JP</label>
                            <input
                                name="jumlah_jp"
                                type="number"
                                required
                                placeholder="Poin JP..."
                                className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-slate-600"
                                value={formData.jumlah_jp}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Penyelenggara</label>
                            <input
                                name="penyelenggara"
                                required
                                placeholder="Instansi / Lembaga Penyelenggara..."
                                className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-slate-600"
                                value={formData.penyelenggara}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Lampiran Bukti (URL/Path)</label>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                <Upload className="h-6 w-6 text-slate-300" />
                                <input
                                    name="file_usulan"
                                    required
                                    placeholder="Masukkan nama file atau path bukti pendukung..."
                                    className="flex-1 bg-transparent outline-none font-bold text-sm text-slate-600"
                                    value={formData.file_usulan}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex flex-col items-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:shadow-blue-300 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                            AJUKAN USULAN SEKARANG
                        </button>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">KEBIJAKAN SI-SOTO Ver v1.0.2</p>
                    </div>
                </form>
            </section>
        </div>
    )
}
