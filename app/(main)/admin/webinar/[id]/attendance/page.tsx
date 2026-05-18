'use client'

import React, { useState, useEffect, use } from 'react'
import {
    ChevronLeft,
    UserCheck,
    Users,
    Loader2,
    Download,
    Search,
    FileSpreadsheet,
    XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import * as XLSX from 'xlsx'

export default function WebinarAttendanceListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const webinarId = parseInt(id)
    const { user } = useAuth()
    const router = useRouter()
    
    const [attendances, setAttendances] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [webinar, setWebinar] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard')
            return
        }
        fetchData()
    }, [user])

    async function fetchData() {
        setLoading(true)
        try {
            const webRes = await fetch(`/api/webinar/${webinarId}`)
            const webData = await webRes.json()
            if (webRes.ok) setWebinar(webData.data)

            const res = await fetch(`/api/webinar/${webinarId}/attendance`)
            const data = await res.json()
            if (res.ok) setAttendances(data.data || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const filteredAttendances = attendances.filter(a => 
        a.user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user.nip.includes(searchTerm) ||
        a.user.unit_kerja?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const exportToExcel = () => {
        const dataToExport = filteredAttendances.map((a, index) => ({
            'No': index + 1,
            'NIP': a.user.nip,
            'Nama': a.user.nama,
            'Jabatan': a.user.jabatan || '-',
            'OPD/Unit Kerja': a.user.unit_kerja || '-',
            'Waktu Absen': new Date(a.created_at).toLocaleString('id-ID')
        }))

        const worksheet = XLSX.utils.json_to_sheet(dataToExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi')
        
        const fileName = `Absensi_${webinar?.nama_webinar || 'Webinar'}.xlsx`
        XLSX.writeFile(workbook, fileName)
    }

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Link
                        href="/admin/webinar"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-all text-xs uppercase tracking-widest"
                    >
                        <ChevronLeft className="h-4 w-4" /> Kembali ke Manajemen
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Daftar <span className="text-emerald-600">Absensi.</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">
                        Webinar: {webinar?.nama_webinar || 'Loading...'}
                    </p>
                </div>
                <button 
                    onClick={exportToExcel}
                    disabled={attendances.length === 0}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
                >
                    <FileSpreadsheet className="h-5 w-5" /> EXPORT ABSENSI
                </button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Memuat Data Absensi...</p>
                </div>
            ) : attendances.length > 0 ? (
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                            <UserCheck className="h-6 w-6 text-emerald-600" />
                            <div>
                                <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest">Total Kehadiran</p>
                                <p className="text-2xl font-black text-emerald-700 leading-none">{attendances.length} Peserta</p>
                            </div>
                        </div>
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input 
                                type="text" 
                                placeholder="Cari NIP, Nama, atau OPD..."
                                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl font-bold text-xs uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">No</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">NIP</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Nama Lengkap</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Jabatan</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">OPD/Unit Kerja</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Waktu Absen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendances.map((a, index) => (
                                    <tr key={a.id} className="group hover:bg-emerald-50/20 transition-all border-b border-slate-50 last:border-0">
                                        <td className="px-8 py-6 text-sm font-black text-slate-300 italic">{(index + 1).toString().padStart(2, '0')}</td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-600 font-mono tracking-tight">{a.user.nip}</td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{a.user.nama}</p>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-500 max-w-[200px] truncate">{a.user.jabatan || '-'}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                {a.user.unit_kerja || '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs italic">
                                                <UserCheck className="h-3 w-3" />
                                                {new Date(a.created_at).toLocaleString('id-ID')}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAttendances.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Tidak ada data absensi yang ditemukan</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 rounded-[4rem] p-40 text-center space-y-6 border-4 border-dashed border-slate-100">
                    <XCircle className="h-20 w-20 text-slate-200 mx-auto" />
                    <h3 className="text-3xl font-black text-slate-300 uppercase italic tracking-tighter">Belum Ada Absensi</h3>
                    <p className="text-slate-400 font-bold italic">Peserta belum melakukan absensi untuk webinar ini.</p>
                </div>
            )}
        </div>
    )
}
