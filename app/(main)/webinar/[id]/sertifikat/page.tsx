'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Loader2, Download, AlertTriangle, RefreshCw, FileText, Info, CloudUpload, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

type CertData = {
    webinar?: {
        nama_webinar?: string
        nama?: string
        tanggal_mulai?: string | null
        template_sertifikat?: string | null
        jumlah_jp?: number | null
    }
    user?: {
        nama?: string
        nip?: string
        unit_kerja?: string | null
    }
    sertifikat?: {
        nomor?: string
        tanggal_cetak?: string
    }
}

type CertAvailability = {
    status: string
    selesaiAt: string | null
    tersediaAt: string | null
    berakhirAt: string | null
    tersediaSetelahJam: number
}

export default function SertifikatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)

    const [data, setData]               = useState<CertData | null>(null)
    const [loading, setLoading]         = useState(true)
    const [error, setError]             = useState('')
    const [availability, setAvailability] = useState<CertAvailability | null>(null)
    const [generating, setGenerating]   = useState(false)
    const [pdfReady, setPdfReady]       = useState(false)
    const [pdfError, setPdfError]       = useState('')
    const [pdfKey, setPdfKey]           = useState(0)
    const [pdfBlobUrl, setPdfBlobUrl]   = useState<string | null>(null)
    const [siasnStatus, setSiasnStatus] = useState<any>(null)
    const [siasnLoading, setSiasnLoading] = useState(false)
    const [siasnMsg, setSiasnMsg] = useState('')

    // Step 1: Ambil metadata sertifikat (cek syarat, nomor, dll)
    useEffect(() => {
        async function fetchMeta() {
            try {
                const res    = await fetch(`/api/webinar/${id}/sertifikat`, { credentials: 'include' })
                const result = await res.json()
                if (res.ok) {
                    setData(result.data)
                    setAvailability(null)
                } else {
                    setError(result.message || 'Gagal memuat sertifikat')
                    setAvailability(result.availability || null)
                }
            } catch {
                setError('Kesalahan koneksi saat memuat sertifikat')
            } finally {
                setLoading(false)
            }
        }
        fetchMeta()
    }, [id])

    // Step 2: Setelah metadata berhasil, trigger generate/load PDF + cek status SIASN
    useEffect(() => {
        if (!data) return
        generatePdf()
        fetchSiasnStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    async function fetchSiasnStatus() {
        try {
            const res = await fetch(`/api/siasn/kursus/status?webinar_id=${id}`, { credentials: 'include' })
            const j = await res.json()
            if (res.ok) setSiasnStatus(j.data)
        } catch {}
    }
    async function handleSiasnSync() {
        setSiasnLoading(true); setSiasnMsg('')
        try {
            const res = await fetch('/api/siasn/kursus/sync', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sumber_type: 'webinar', sumber_id: Number(id) }) })
            const j = await res.json()
            setSiasnMsg(j.message || j.status || '')
            await fetchSiasnStatus()
        } catch (e: any) { setSiasnMsg(e.message) }
        finally { setSiasnLoading(false) }
    }
    async function handleUploadDok(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]; if (!file) return
        setSiasnLoading(true); setSiasnMsg('')
        try {
            const fd = new FormData()
            fd.append('sumber_type', 'webinar'); fd.append('sumber_id', String(id)); fd.append('file', file)
            const res = await fetch('/api/siasn/kursus/upload-dok', { method: 'POST', credentials: 'include', body: fd })
            const j = await res.json()
            setSiasnMsg(j.message || (j.success ? 'Upload berhasil' : 'Gagal'))
            await fetchSiasnStatus()
        } catch (e: any) { setSiasnMsg(e.message) }
        finally { setSiasnLoading(false); e.target.value='' }
    }

    // cleanup blob URL
    useEffect(() => { return () => { if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl) } }, [pdfBlobUrl])

    async function generatePdf(refresh = false) {
        setGenerating(true)
        setPdfReady(false)
        setPdfError('')
        if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); setPdfBlobUrl(null) }

        try {
            const url = `/api/webinar/${id}/sertifikat/pdf${refresh ? '?refresh=1' : ''}`
            const res = await fetch(url, { credentials: 'include' })
            const ct = res.headers.get('Content-Type') || ''

            if (res.ok && ct.includes('application/pdf')) {
                const blob = await res.blob()
                const objUrl = URL.createObjectURL(blob)
                setPdfBlobUrl(objUrl)
                setPdfReady(true)
                setPdfKey(k => k + 1)
            } else if (res.ok && ct.includes('officedocument')) {
                // Server fallback DOCX — tampilkan fallback (backend sekarang jarang kirim ini, tapi tetap handle)
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
        const isAvailability = !!availability
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center space-y-6">
                <div className="h-24 w-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center">
                    <AlertTriangle className="h-12 w-12" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        {isAvailability ? 'Sertifikat Belum Dapat Diunduh' : 'Sertifikat Belum Tersedia'}
                    </h2>
                    <p className="text-slate-600 font-medium">{error}</p>
                    {isAvailability && (
                        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left space-y-1.5">
                            <p className="text-sm font-bold text-amber-700">Informasi Unduhan Sertifikat</p>
                            <ul className="text-xs text-slate-600 font-medium space-y-1">
                                <li>• Sertifikat dapat diunduh setelah webinar selesai.</li>
                                <li>• Sertifikat <b>tidak ada batas waktu</b> unduh.</li>
                            </ul>
                        </div>
                    )}
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
                        {/* Sinkron SIASN */}
                        <div className="flex items-center gap-2">
                            <button onClick={handleSiasnSync} disabled={siasnLoading} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border transition-all text-sm ${siasnStatus?.status==='synced' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : siasnStatus?.status==='queued_simegilan' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} disabled:opacity-50`}>
                                {siasnLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : siasnStatus?.status==='synced' ? <CheckCircle2 className="h-4 w-4"/> : siasnStatus?.status==='queued_simegilan' ? <Clock className="h-4 w-4"/> : <CloudUpload className="h-4 w-4"/>}
                                {siasnStatus?.status==='synced' ? 'Tersinkron' : siasnStatus?.status==='queued_simegilan' ? 'Antre' : 'Sinkron ke SIASN'}
                            </button>
                            <label className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-200">
                                <CloudUpload className="h-3 w-3"/> Upload Dok
                                <input type="file" accept="application/pdf" className="hidden" onChange={handleUploadDok} disabled={siasnLoading || !siasnStatus?.siasn_id} />
                            </label>
                        </div>
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

                        {/* Download button — uses blob URL jika ada, fallback ke endpoint */}
                        {pdfReady && (
                            <a
                                href={pdfBlobUrl || `/api/webinar/${id}/sertifikat/pdf`}
                                download={`Sertifikat-${data?.webinar?.nama || id}.pdf`}
                                target="_blank"
                                rel="noopener"
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

                {/* SIASN status */}
                {(siasnStatus || siasnMsg) && (
                    <div className={`rounded-2xl px-5 py-3.5 border text-sm flex items-start gap-3 ${siasnStatus?.status==='synced' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : siasnStatus?.status==='queued_simegilan' ? 'bg-amber-50 border-amber-200 text-amber-800' : siasnStatus?.status==='failed' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {siasnStatus?.status==='synced' ? <CheckCircle2 className="h-5 w-5 shrink-0"/> : siasnStatus?.status==='queued_simegilan' ? <Clock className="h-5 w-5 shrink-0"/> : <Info className="h-5 w-5 shrink-0"/>}
                        <div className="flex-1">
                            <p className="font-bold">Status SIASN: {siasnStatus?.status || 'belum sinkron'} {siasnStatus?.siasn_id ? `• ${siasnStatus.siasn_id}` : ''}</p>
                            {siasnStatus?.error_msg && <p className="text-xs mt-1 opacity-80">{siasnStatus.error_msg}</p>}
                            {siasnMsg && <p className="text-xs mt-1 font-semibold">{siasnMsg}</p>}
                            {siasnStatus?.status==='queued_simegilan' && <p className="text-xs mt-1">SIASN down — data antre di Simegilan, cron akan retry otomatis.</p>}
                        </div>
                    </div>
                )}

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
                                href={pdfBlobUrl || `/api/webinar/${id}/sertifikat/pdf`}
                                target="_blank"
                                rel="noopener"
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

                    {/* PDF preview — blob URL, cross-browser (Chrome/Mozilla/Mobile). Fallback object+embed */}
                    {pdfReady && pdfBlobUrl && (
                        <object key={pdfKey} data={pdfBlobUrl} type="application/pdf" className="w-full h-full border-none">
                            <embed src={pdfBlobUrl} type="application/pdf" className="w-full h-full border-none" />
                            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                                <FileText className="h-12 w-12 text-slate-400" />
                                <p className="text-sm text-slate-500">Preview tidak didukung di browser ini.</p>
                                <a href={pdfBlobUrl} target="_blank" rel="noopener" download={`Sertifikat-${data?.webinar?.nama || id}.pdf`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
                                    <Download className="h-5 w-5" /> Buka / Unduh PDF
                                </a>
                            </div>
                        </object>
                    )}
                    {/* Fallback jika pdfReady tapi blob belum siap (mis. direct link) */}
                    {pdfReady && !pdfBlobUrl && (
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
