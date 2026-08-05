'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Loader2, Download, AlertTriangle, RefreshCw, FileText } from 'lucide-react'
import Link from 'next/link'

export default function SertifikatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)

    const [data, setData]               = useState<any>(null)
    const [loading, setLoading]         = useState(true)
    const [error, setError]             = useState('')
    const [generating, setGenerating]   = useState(false)
    const [pdfReady, setPdfReady]       = useState(false)
    const [pdfError, setPdfError]       = useState('')
    const [pdfKey, setPdfKey]           = useState(0)   // increment to reload iframe

    // Step 1: Ambil metadata sertifikat (cek syarat, nomor, dll)
    useEffect(() => {
        async function fetchMeta() {
            try {
                const res    = await fetch(`/api/webinar/${id}/sertifikat`, { credentials: 'include' })
                const result = await res.json()
                if (res.ok) {
                    setData(result.data)
                } else {
                    setError(result.message || 'Gagal memuat sertifikat')
                }
            } catch {
                setError('Kesalahan koneksi saat memuat sertifikat')
            } finally {
                setLoading(false)
            }
        }
        fetchMeta()
    }, [id])

    // Step 2: Setelah metadata berhasil, trigger generate/load PDF
    useEffect(() => {
        if (!data) return
        generatePdf()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    async function generatePdf(refresh = false) {
        setGenerating(true)
        setPdfReady(false)
        setPdfError('')

        try {
            const url = `/api/webinar/${id}/sertifikat/pdf${refresh ? '?refresh=1' : ''}`
            const res = await fetch(url, { credentials: 'include' })

            if (res.ok && res.headers.get('Content-Type')?.includes('application/pdf')) {
                // PDF berhasil dihasilkan / sudah ada → tampilkan iframe
                setPdfReady(true)
                setPdfKey(k => k + 1)
            } else if (res.ok && res.headers.get('Content-Type')?.includes('officedocument')) {
                // Fallback: LibreOffice gagal, server kirim DOCX
                setPdfError('DOCX_FALLBACK')
            } else {
                const json = await res.json().catch(() => ({}))
                setPdfError(json.message || 'Gagal menghasilkan sertifikat PDF')
            }
        } catch {
            setPdfError('Koneksi gagal saat memuat PDF')
        } finally {
            setGenerating(false)
        }
    }

    // ── State: loading metadata ─────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-600 font-bold animate-pulse">Memeriksa kelengkapan data...</p>
            </div>
        )
    }

    // ── State: error syarat ─────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center space-y-6">
                <div className="h-24 w-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center">
                    <AlertTriangle className="h-12 w-12" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Sertifikat Belum Tersedia</h2>
                    <p className="text-slate-600 font-medium">{error}</p>
                </div>
                <Link
                    href={`/webinar/${id}`}
                    className="bg-slate-900 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                    Kembali ke Detail Webinar
                </Link>
            </div>
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-6 mb-8">

                {/* Header bar */}
                <div className="flex items-center justify-between bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                    <Link
                        href={`/webinar/${id}`}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Kembali ke Webinar
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* Regenerate button */}
                        <button
                            onClick={() => generatePdf(true)}
                            disabled={generating}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold border border-slate-200 px-4 py-2.5 rounded-xl transition-all hover:border-blue-200 disabled:opacity-40"
                            title="Buat ulang sertifikat"
                        >
                            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                            <span className="text-sm">Buat Ulang</span>
                        </button>

                        {/* Download button — only visible when PDF is ready */}
                        {pdfReady && (
                            <a
                                href={`/api/webinar/${id}/sertifikat/pdf`}
                                download={`Sertifikat-${data?.webinar?.nama || id}.pdf`}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                <Download className="h-5 w-5" />
                                Unduh PDF
                            </a>
                        )}
                    </div>
                </div>

                {/* Info card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex flex-wrap gap-6 text-sm font-semibold text-slate-600">
                    <div>
                        <span className="text-slate-400 font-medium block text-xs mb-0.5">Nama</span>
                        {data?.user?.nama}
                    </div>
                    <div>
                        <span className="text-slate-400 font-medium block text-xs mb-0.5">NIP</span>
                        {data?.user?.nip ? `NIP. ${data.user.nip}` : '-'}
                    </div>
                    <div>
                        <span className="text-slate-400 font-medium block text-xs mb-0.5">OPD / Unit Kerja</span>
                        {data?.user?.unit_kerja || 'Surajaya Corpu'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-slate-400 font-medium block text-xs mb-0.5">Nomor Sertifikat</span>
                        <span className="truncate block">{data?.sertifikat?.nomor || '-'}</span>
                    </div>
                </div>

                {/* ── PDF Preview Area ─────────────────────────────────────── */}
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 w-full h-[72vh] min-h-[520px]">

                    {/* Loading overlay: generating PDF */}
                    {generating && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-5 text-center px-6">
                            <div className="relative">
                                <div className="h-20 w-20 rounded-[1.5rem] bg-blue-50 flex items-center justify-center">
                                    <FileText className="h-10 w-10 text-blue-500" />
                                </div>
                                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500"></span>
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-base font-extrabold text-slate-800">Memproses Sertifikat...</h4>
                                <p className="text-sm text-slate-400 font-semibold max-w-xs leading-relaxed">
                                    Data Anda sedang digabungkan ke dalam template dan dikonversi ke PDF.
                                    Proses ini membutuhkan waktu beberapa detik.
                                </p>
                            </div>
                            <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                        </div>
                    )}

                    {/* Error fallback: konversi gagal, kirim DOCX */}
                    {!generating && pdfError === 'DOCX_FALLBACK' && (
                        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center gap-5 text-center px-8">
                            <div className="h-20 w-20 rounded-[1.5rem] bg-amber-50 flex items-center justify-center">
                                <FileText className="h-10 w-10 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-base font-extrabold text-slate-800">Preview PDF Tidak Tersedia</h4>
                                <p className="text-sm text-slate-500 font-medium max-w-sm leading-relaxed">
                                    LibreOffice tidak terinstall di server. Sertifikat Anda sudah terisi penuh namun
                                    hanya tersedia dalam format Word (.docx).
                                </p>
                            </div>
                            <a
                                href={`/api/webinar/${id}/sertifikat/pdf`}
                                download={`Sertifikat-${data?.webinar?.nama || id}.docx`}
                                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
                            >
                                <Download className="h-5 w-5" />
                                Unduh Sertifikat (.docx)
                            </a>
                        </div>
                    )}

                    {/* Error: general error */}
                    {!generating && pdfError && pdfError !== 'DOCX_FALLBACK' && (
                        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center gap-4 text-center px-8">
                            <AlertTriangle className="h-12 w-12 text-red-400" />
                            <div>
                                <h4 className="text-base font-extrabold text-slate-800 mb-1">Gagal Memuat PDF</h4>
                                <p className="text-sm text-slate-500 font-medium">{pdfError}</p>
                            </div>
                            <button
                                onClick={() => generatePdf(false)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Coba Lagi
                            </button>
                        </div>
                    )}

                    {/* The PDF iframe — shown when pdfReady */}
                    {pdfReady && (
                        <iframe
                            key={pdfKey}
                            src={`/api/webinar/${id}/sertifikat/pdf`}
                            className="w-full h-full border-none"
                            title="Pratinjau Sertifikat PDF"
                        />
                    )}
                </div>

            </div>
        </div>
    )
}
