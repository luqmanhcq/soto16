'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CloudUpload, Download, Loader2, CheckCircle2, XCircle, FileText, AlertTriangle, RefreshCw, ChevronDown, UploadCloud } from 'lucide-react'

type BulkRow = {
  user_id: number
  nip: string
  nama: string
  eligible: boolean
  skip_reason: string | null
  has_cert_before: boolean
  cert_generated: boolean
  nomor_sertifikat: string | null
  has_pdf: boolean
  siasn_before: string | null
  siasn_id_before: string | null
  file_pending: boolean
  sync_result: string | null
  siasn_id_after: string | null
  message: string | null
}

type Summary = {
  total: number
  eligible: number
  skipped_ineligible: number
  cert_generated: number
  already_synced: number
  file_pending: number
  synced: number
  synced_data_only: number
  file_susul: number
  queued: number
  failed: number
}

export default function SiasnBulkSyncPanel({ webinarId }: { webinarId: string | number }) {
  const [preview, setPreview] = useState<{ webinar: any; rows: BulkRow[]; summary: Summary } | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0, label: '' })
  const [rows, setRows] = useState<BulkRow[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [notice, setNotice] = useState('')
  const [susulLoading, setSusulLoading] = useState(false)
  const rowsRef = useRef<BulkRow[]>([])
  const esRef = useRef<EventSource | null>(null)

  const fetchPreview = async () => {
    setLoading(true); setNotice('')
    try {
      const res = await fetch(`/api/admin/webinar/${webinarId}/siasn-bulk`, { credentials: 'include' })
      const j = await res.json()
      if (!res.ok) throw new Error(j.message || 'Gagal memuat status')
      setPreview(j)
      setRows(j.rows || [])
      rowsRef.current = j.rows || []
      setSummary(j.summary || null)
    } catch (e: any) { setNotice(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPreview(); return () => { esRef.current?.close() } }, [webinarId])

  const mergeRows = (incoming: BulkRow[]) => {
    setRows(prev => {
      const map = new Map(prev.map(r => [r.user_id, r]))
      for (const r of incoming) map.set(r.user_id, r)
      const next = [...map.values()]
      rowsRef.current = next
      return next
    })
  }

  const recomputeSummary = (list: BulkRow[]): Summary => ({
    total: list.length,
    eligible: list.filter(r => r.eligible).length,
    skipped_ineligible: list.filter(r => !r.eligible).length,
    cert_generated: list.filter(r => r.cert_generated).length,
    already_synced: list.filter(r => r.siasn_before === 'synced' && !r.file_pending).length,
    file_pending: list.filter(r => r.file_pending && r.sync_result !== 'file_susul').length,
    synced: list.filter(r => r.sync_result === 'synced').length,
    synced_data_only: list.filter(r => r.sync_result === 'synced_data_only').length,
    file_susul: list.filter(r => r.sync_result === 'file_susul').length,
    queued: list.filter(r => r.sync_result === 'queued').length,
    failed: list.filter(r => r.sync_result === 'failed').length,
  })

  const runBatch = (offset: number, limit: number, onlyFailed = false): Promise<{ hasMore: boolean; nextOffset: number }> => {
    return new Promise((resolve, reject) => {
      const es = new EventSource(`/api/admin/webinar/${webinarId}/siasn-bulk?stream=1&limit=${limit}&offset=${offset}${onlyFailed ? '&onlyFailed=1' : ''}`)
      esRef.current = es
      let finished = false
      es.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data)
          if (d.type === 'progress') {
            setProgress({ current: d.current, total: d.total, percent: d.percent, label: `${d.row?.nip || ''} — ${d.row?.nama || ''}` })
            mergeRows([d.row])
          } else if (d.type === 'done') {
            finished = true
            mergeRows(d.rows || [])
            es.close()
            resolve({ hasMore: !!d.hasMore, nextOffset: d.nextOffset ?? (offset + limit) })
          } else if (d.type === 'error') {
            finished = true
            es.close()
            reject(new Error(d.message || 'Gagal sinkron batch'))
          }
        } catch {}
      }
      es.onerror = () => {
        es.close()
        if (!finished) reject(new Error('Koneksi terputus di tengah batch — dicoba lagi otomatis'))
      }
    })
  }

  // Baris yang masih perlu diproses (untuk mode gagal-saja & estimasi)
  const actionableRows = rows.filter(r => r.eligible && !(r.siasn_before === 'synced' && !r.file_pending))
  const estimateText = (n: number) => {
    if (n <= 0) return 'tidak ada antrean'
    const sec = n * 8
    return sec < 60 ? `±${sec} detik` : `±${Math.ceil(sec / 60)} menit`
  }

  const startSync = async (onlyFailed = false) => {
    if (running) return
    setRunning(true); setNotice('')
    const BATCH = 10
    // Total versi server = daftar actionable (mode gagal-saja) atau semua baris
    const total = onlyFailed ? actionableRows.length : (rows.length || 0)
    setProgress({ current: 0, total, percent: 0, label: 'Memulai...' })
    let offset = 0
    let failedBatches = 0
    try {
      while (offset < Math.max(total, 1)) {
        let ok = false
        for (let attempt = 1; attempt <= 2 && !ok; attempt++) {
          try {
            const r = await runBatch(offset, BATCH, onlyFailed)
            ok = true
            if (!r.hasMore) { offset = Number.MAX_SAFE_INTEGER; break }
            offset = r.nextOffset
          } catch (e: any) {
            if (attempt === 2) {
              failedBatches++
              setNotice(`Batch ${offset} gagal 2x (${e.message}). Lanjut batch berikut — yang sudah sync aman.`)
              offset += BATCH
            } else {
              await new Promise(res => setTimeout(res, 2000))
            }
          }
        }
        if (offset === Number.MAX_SAFE_INTEGER) break
      }
      if (rowsRef.current.length) setSummary(recomputeSummary(rowsRef.current))
      rowsRef.current = []
      setProgress(p => ({ ...p, current: p.total, percent: 100, label: failedBatches ? `Selesai (${failedBatches} batch gagal — ulangi untuk sisanya)` : 'Selesai' }))
      await fetchPreview()
    } finally {
      setRunning(false)
    }
  }

  const susulFiles = async () => {
    setSusulLoading(true); setNotice('')
    try {
      const res = await fetch(`/api/admin/webinar/${webinarId}/siasn-bulk/files`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit: 50 }) })
      const j = await res.json()
      if (!res.ok) throw new Error(j.message || 'Gagal susulan file')
      setNotice(`${j.done} file tersusul, ${j.still_pending} masih menunggu PDF.`)
      await fetchPreview()
    } catch (e: any) { setNotice(e.message) }
    finally { setSusulLoading(false) }
  }

  const downloadCsv = () => {
    const header = ['NIP', 'Nama', 'Syarat', 'Sertifikat', 'SIASN', 'Hasil'].join(';')
    const lines = rows.map(r => [
      r.nip, `"${(r.nama || '').replace(/"/g, '""')}"`,
      r.eligible ? 'OK' : (r.skip_reason || 'TIDAK'),
      r.nomor_sertifikat || '-',
      r.siasn_id_after || r.siasn_id_before || '-',
      r.sync_result || r.siasn_before || '-',
    ].join(';'))
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `laporan-siasn-webinar-${webinarId}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
  }

  // Angka ringkas: siap / tersinkron / perlu perhatian / skip
  const siap = (summary?.eligible || 0) - (summary?.already_synced || 0) - (summary?.file_pending || 0)
  const tersinkron = (summary?.already_synced || 0) + (summary?.synced || 0) + (summary?.file_susul || 0)
  const perhatian = (summary?.queued || 0) + (summary?.failed || 0) + (summary?.file_pending || 0) + (summary?.synced_data_only || 0)
  const selesai = !!preview?.webinar?.selesai
  const gagalSaja = actionableRows.length
  // Wizard 3 langkah untuk pemula: cek syarat → sertifikat+PDF → kirim SIASN
  const stepSyarat = { done: (summary?.eligible || 0), total: summary?.total || 0 }
  const stepSertifikat = {
    done: rows.filter(r => r.nomor_sertifikat && r.has_pdf).length,
    total: summary?.eligible || 0,
  }
  const stepKirim = { done: tersinkron, total: summary?.eligible || 0 }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <CloudUpload className="h-5 w-5 text-indigo-600 shrink-0" /> Sinkron SIASN
            {loading && <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />}
          </h2>
          {running ? (
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                <span className="truncate">{progress.label || 'Proses...'}</span>
                <span className="shrink-0 ml-2 tabular-nums">{progress.current}/{progress.total} • {progress.percent}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          ) : summary ? (
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              <b className="text-slate-900">{tersinkron}</b> tersinkron
              {siap > 0 && <> • <b className="text-indigo-600">{siap} siap dikirim</b></>}
              {perhatian > 0 && <> • <b className="text-amber-600">{perhatian} perlu perhatian</b></>}
              <span className="text-slate-400"> • {summary.total} peserta</span>
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">Memuat status...</p>
          )}
          {notice && <p className="mt-1.5 text-xs font-semibold text-amber-700 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />{notice}</p>}
          {!running && summary && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 flex-wrap">
              {[
                { n: 1, t: `Cek syarat ${stepSyarat.done}/${stepSyarat.total}`, ok: stepSyarat.total > 0 },
                { n: 2, t: `Sertifikat+PDF ${stepSertifikat.done}/${stepSertifikat.total}`, ok: stepSertifikat.done > 0 },
                { n: 3, t: `Terkirim ${stepKirim.done}/${stepKirim.total}`, ok: stepKirim.done === stepKirim.total && stepKirim.total > 0 },
              ].map((s, i, arr) => (
                <span key={s.n} className="inline-flex items-center gap-1.5">
                  <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-black ${s.ok ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {s.ok ? <CheckCircle2 className="h-3 w-3" /> : s.n}
                  </span>
                  <span className={s.ok ? 'text-slate-700' : ''}>{s.t}</span>
                  {i < arr.length - 1 && <span className="text-slate-300 mx-0.5">→</span>}
                </span>
              ))}
              {gagalSaja > 0 && <span className="text-slate-400">• estimasi {estimateText(gagalSaja)}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {(summary?.file_pending || 0) > 0 && !running && (
            <button onClick={susulFiles} disabled={susulLoading} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50">
              {susulLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Susulkan File ({summary?.file_pending})
            </button>
          )}
          {gagalSaja > 0 && !running && (
            <button onClick={() => startSync(true)} disabled={loading || !selesai} title="Hanya proses yang belum beres — yang sudah sinkron dilewati" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-50 disabled:opacity-50">
              <RefreshCw className="h-4 w-4" />
              Gagal saja ({gagalSaja})
            </button>
          )}
          <button onClick={() => startSync(false)} disabled={loading || running || !selesai} title={!selesai ? 'Aktif setelah webinar selesai' : `Estimasi ${estimateText(rows.length)}`} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 disabled:opacity-50">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
            {running ? 'Berjalan...' : siap > 0 ? `Sinkron (${siap})` : 'Sinkron Ulang'}
          </button>
          <button onClick={() => setShowDetail(v => !v)} className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200">
            Detail <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDetail ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showDetail && (
        <div className="border-t border-slate-100 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">{summary?.skipped_ineligible || 0} tidak memenuhi syarat • {summary?.cert_generated || 0} sertifikat dibuat</p>
            <div className="flex gap-2">
              <button onClick={fetchPreview} disabled={loading || running} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-50">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button onClick={downloadCsv} disabled={!rows.length} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead className="sticky top-0 bg-slate-50"><tr>
                {['Peserta', 'Syarat', 'Sertifikat', 'SIASN', 'Hasil'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(r => (
                  <tr key={r.user_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5"><p className="text-xs font-bold text-slate-900 font-mono">{r.nip}</p><p className="text-xs text-slate-500 truncate max-w-[220px]">{r.nama}</p></td>
                    <td className="px-4 py-2.5">{r.eligible
                      ? <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle2 className="h-3.5 w-3.5" /> OK</span>
                      : <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-bold"><XCircle className="h-3.5 w-3.5" /> {r.skip_reason}</span>}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{r.nomor_sertifikat ? (r.cert_generated ? 'dibuat' : 'ada') : '-'}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{r.siasn_id_after || r.siasn_id_before ? `${(r.siasn_id_after || r.siasn_id_before || '').slice(0, 8)}…` : '-'}</td>
                    <td className="px-4 py-2.5">
                      {!r.eligible
                        ? <span className="text-[10px] font-black text-slate-400 uppercase">Skip</span>
                        : r.sync_result === 'synced' || r.sync_result === 'file_susul'
                          ? <span className="text-[10px] font-black text-emerald-600 uppercase">Tersinkron{r.sync_result === 'file_susul' ? ' ✓' : ''}</span>
                          : r.sync_result === 'synced_data_only' || r.file_pending
                            ? <span className="text-[10px] font-black text-blue-600 uppercase">File menyusul</span>
                            : r.sync_result === 'queued'
                              ? <span className="text-[10px] font-black text-amber-600 uppercase">Antre</span>
                              : r.sync_result === 'failed'
                                ? <span className="text-[10px] font-black text-red-600 uppercase">Gagal</span>
                                : r.siasn_before === 'synced'
                                  ? <span className="text-[10px] font-black text-emerald-600 uppercase">Sudah</span>
                                  : <span className="text-[10px] font-black text-slate-400 uppercase">Belum</span>}
                      {r.sync_result === 'synced_data_only' || r.file_pending ? (
                        <span className="block text-[10px] text-slate-400 font-medium normal-case" title="Data sudah di SIASN; file otomatis tersusul oleh cron/tombol Susulkan File/re-run begitu PDF ada. Cek di /api/health/siasn → files_pending_upload"><FileText className="h-3 w-3 inline mr-0.5" />file otomatis menyusul</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">Belum ada peserta.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
