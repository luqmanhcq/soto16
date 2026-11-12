import { db } from '@/lib/db'
import {
  webinarsTable,
  webinarParticipantsTable,
  webinarAttendancesTable,
  webinarQuestionsTable,
  webinarUserAnswersTable,
  usersTable,
  sertifikatWebinarTable,
  siasnRiwayatSyncTable,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { siasnKursusService } from '@/lib/services/siasn-kursus.service'
import { sertifikatWebinarService } from '@/lib/services/sertifikat-webinar.service'
import { ensureWebinarCertificatePdf } from '@/lib/services/webinar-sertifikat-pdf.service'

export type BulkRow = {
  user_id: number
  nip: string
  nama: string
  eligible: boolean
  skip_reason: string | null
  has_cert_before: boolean
  cert_generated: boolean
  nomor_sertifikat: string | null
  sertifikat_id: number | null
  has_pdf: boolean
  siasn_before: string | null
  siasn_id_before: string | null
  file_pending: boolean
  sync_result: 'synced' | 'synced_data_only' | 'file_susul' | 'skipped' | 'failed' | 'queued' | null
  siasn_id_after: string | null
  message: string | null
}

export const FILE_PENDING_PREFIX = 'FILE_PENDING:'

export function isFilePending(status: string | null, errorMsg: string | null): boolean {
  return status === 'synced' && !!errorMsg && errorMsg.startsWith(FILE_PENDING_PREFIX)
}

export type BulkSummary = {
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

const SIASN_DELAY_MS = 600
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function webinarSelesai(webinar: { tanggal_selesai: Date | string | null; status: string }): boolean {
  if (webinar.status === 'selesai') return true
  if (webinar.tanggal_selesai && new Date(webinar.tanggal_selesai).getTime() < Date.now()) return true
  return false
}

export class SiasnBulkService {
  async previewWebinar(webinarId: number): Promise<{ webinar: any; rows: BulkRow[]; summary: BulkSummary }> {
    const [webinar] = await db.select().from(webinarsTable).where(eq(webinarsTable.id, webinarId))
    if (!webinar) throw new Error('Webinar tidak ditemukan')

    const participants = await db.select().from(webinarParticipantsTable).where(eq(webinarParticipantsTable.webinar_id, webinarId)).orderBy(webinarParticipantsTable.id)
    const attendances = await db.select().from(webinarAttendancesTable).where(eq(webinarAttendancesTable.webinar_id, webinarId))
    const questions = await db.select().from(webinarQuestionsTable).where(eq(webinarQuestionsTable.webinar_id, webinarId))
    const answers = await db.select().from(webinarUserAnswersTable).where(eq(webinarUserAnswersTable.webinar_id, webinarId))
    const certs = await db.select().from(sertifikatWebinarTable).where(eq(sertifikatWebinarTable.webinar_id, webinarId))
    const syncs = await db.select().from(siasnRiwayatSyncTable).where(eq(siasnRiwayatSyncTable.sumber_type, 'webinar' as any))

    const hasMonev = questions.some((q) => q.type === 'monev')
    const hasPostTest = questions.some((q) => q.type === 'post_test')
    const attSet = new Set(attendances.map((a) => a.user_id))
    const certByUser = new Map(certs.map((c) => [c.user_id, c]))
    const syncByUser = new Map(syncs.filter((s) => (s as any).sumber_id && certByUser.has((s as any).user_id)).map((s) => [(s as any).user_id, s]))

    const fs = await import('fs/promises')
    const path = await import('path')
    const rows: BulkRow[] = []
    for (const p of participants) {
      const [u] = await db.select().from(usersTable).where(eq(usersTable.id, p.user_id))
      if (!u) continue
      const userAnswers = answers.filter((a) => a.user_id === p.user_id)
      let skip: string | null = null
      if (!attSet.has(p.user_id)) skip = 'Belum absen'
      else if (hasMonev && !userAnswers.some((a) => a.type === 'monev')) skip = 'Belum isi MONEV'
      else if (hasPostTest && !userAnswers.some((a) => a.type === 'post_test')) skip = 'Belum post-test'
      const cert = certByUser.get(p.user_id)
      const sync = syncByUser.get(p.user_id)
      let hasPdf = false
      try {
        await fs.access(path.join(process.cwd(), 'public', 'sertifikat', `${webinarId}-${p.user_id}.pdf`))
        hasPdf = true
      } catch {}
      const syncStatus = (sync as any)?.status || null
      const filePending = isFilePending(syncStatus, (sync as any)?.error_msg || null)
      rows.push({
        user_id: p.user_id,
        nip: u.nip,
        nama: u.nama,
        eligible: !skip,
        skip_reason: skip,
        has_cert_before: !!cert,
        cert_generated: false,
        nomor_sertifikat: cert?.nomor_sertifikat || p.nomor_sertifikat || null,
        sertifikat_id: (cert as any)?.id || null,
        has_pdf: hasPdf,
        siasn_before: syncStatus,
        siasn_id_before: (sync as any)?.siasn_id || null,
        file_pending: filePending,
        sync_result: syncStatus === 'synced' && !filePending ? 'skipped' : null,
        siasn_id_after: (sync as any)?.siasn_id || null,
        message: syncStatus === 'synced' && !filePending ? 'Sudah sinkron — skip' : filePending ? 'Data sinkron, file menunggu PDF asli' : null,
      })
    }

    return {
      webinar: { id: webinar.id, nama_webinar: webinar.nama_webinar, status: webinar.status, tanggal_selesai: webinar.tanggal_selesai, selesai: webinarSelesai(webinar) },
      rows,
      summary: this.summarize(rows),
    }
  }

  private summarize(rows: BulkRow[]): BulkSummary {
    return {
      total: rows.length,
      eligible: rows.filter((r) => r.eligible).length,
      skipped_ineligible: rows.filter((r) => !r.eligible).length,
      cert_generated: rows.filter((r) => r.cert_generated).length,
      already_synced: rows.filter((r) => r.siasn_before === 'synced' && !r.file_pending).length,
      file_pending: rows.filter((r) => r.file_pending).length,
      synced: rows.filter((r) => r.sync_result === 'synced').length,
      synced_data_only: rows.filter((r) => r.sync_result === 'synced_data_only').length,
      file_susul: rows.filter((r) => r.sync_result === 'file_susul').length,
      queued: rows.filter((r) => r.sync_result === 'queued').length,
      failed: rows.filter((r) => r.sync_result === 'failed').length,
    }
  }

  /**
   * Sinkron all: eligible → generate sertifikat bila belum → sync SIASN (+file bila PDF asli ada).
   * Berjalan sekuensial dengan delay antar call SIASN. onEvent dipanggil per peserta (untuk SSE progress bar).
   */
  async syncAllWebinar(
    webinarId: number,
    onEvent?: (ev: { current: number; total: number; percent: number; row: BulkRow }) => void | Promise<void>,
    opts?: { force?: boolean; limit?: number; offset?: number; onlyFailed?: boolean },
  ): Promise<{ webinar: any; rows: BulkRow[]; summary: BulkSummary; total: number; offset: number; limit: number; hasMore: boolean; nextOffset: number }> {
    const [webinar] = await db.select().from(webinarsTable).where(eq(webinarsTable.id, webinarId))
    if (!webinar) throw new Error('Webinar tidak ditemukan')
    if (!opts?.force && !webinarSelesai(webinar)) {
      throw new Error('Webinar belum selesai — sinkron all hanya untuk webinar yang sudah selesai')
    }

    const preview = await this.previewWebinar(webinarId)
    // Mode gagal-saja: hanya proses yang belum beres (eligible tapi belum synced penuh).
    // Baris synced-penuh & tidak-eligible dilewati tanpa disentuh.
    const actionable = opts?.onlyFailed
      ? preview.rows.filter((r) => r.eligible && !(r.siasn_before === 'synced' && !r.file_pending))
      : preview.rows
    const total = actionable.length
    const offset = Math.max(0, opts?.offset || 0)
    const limit = Math.min(Math.max(1, opts?.limit || total || 50), 200)
    const rows = actionable.slice(offset, offset + limit)
    const hasMore = offset + rows.length < total

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        // 1. Eligibilitas — skip bila tidak memenuhi
        if (!row.eligible) {
          row.sync_result = 'skipped'
          row.message = `Skip: ${row.skip_reason}`
        } else if (row.siasn_before === 'synced' && !row.file_pending) {
          // Sudah sinkron penuh — skip
          row.sync_result = 'skipped'
          row.message = 'Sudah sinkron — skip'
          row.siasn_id_after = row.siasn_id_before
        } else if (row.siasn_before === 'synced' && row.file_pending) {
          // File menyusul: PDF kini ada → upgrade via document/save (id = siasn_id)
          if (!row.has_pdf) {
            row.sync_result = 'skipped'
            row.message = 'File masih menunggu PDF asli (peserta belum buka sertifikat)'
            row.siasn_id_after = row.siasn_id_before
          } else {
            const certRows = await db.select().from(sertifikatWebinarTable).where(eq(sertifikatWebinarTable.id, row.sertifikat_id!)).limit(1)
            const payload = await siasnKursusService.buildPayloadFromWebinar(certRows[0] as any)
            const realPdf = await siasnKursusService.getRealPdfBuffer(certRows[0] as any)
            if (!payload || !realPdf) {
              row.sync_result = 'skipped'
              row.message = 'File masih menunggu PDF asli'
              row.siasn_id_after = row.siasn_id_before
            } else {
              const save = await siasnKursusService.postKursusDocumentSave(payload, realPdf.buffer, realPdf.fileName, { id: row.siasn_id_before || '' })
              if (save.ok) {
                const rwId = save.rwKursusId || row.siasn_id_before || ''
                await db.update(siasnRiwayatSyncTable).set({ error_msg: null as any, siasn_id: rwId, synced_at: new Date() }).where(and(eq(siasnRiwayatSyncTable.user_id, row.user_id), eq(siasnRiwayatSyncTable.sumber_type, 'webinar' as any), eq(siasnRiwayatSyncTable.sumber_id, row.sertifikat_id!)))
                row.sync_result = 'file_susul'
                row.siasn_id_after = rwId
                row.file_pending = false
                row.message = `File tersusul (${rwId})`
              } else {
                // Backoff eksponensial agar run berikutnya tidak menghantam baris yang sama
                const [syncRow] = await db.select().from(siasnRiwayatSyncTable).where(and(eq(siasnRiwayatSyncTable.user_id, row.user_id), eq(siasnRiwayatSyncTable.sumber_type, 'webinar' as any), eq(siasnRiwayatSyncTable.sumber_id, row.sertifikat_id!))).limit(1)
                const nextCount = ((syncRow as any)?.retry_count || 0) + 1
                const delays = [5, 30, 120, 720, 1440]
                const failStatus = nextCount >= 5 ? 'failed' : 'synced'
                await db.update(siasnRiwayatSyncTable).set({
                  status: failStatus as any,
                  retry_count: nextCount,
                  next_retry_at: new Date(Date.now() + delays[Math.min(nextCount, delays.length - 1)] * 60 * 1000),
                  error_msg: `FILE_PENDING: ${save.message?.slice(0, 180) || 'Susulan file gagal'}`,
                } as any).where(and(eq(siasnRiwayatSyncTable.user_id, row.user_id), eq(siasnRiwayatSyncTable.sumber_type, 'webinar' as any), eq(siasnRiwayatSyncTable.sumber_id, row.sertifikat_id!)))
                row.sync_result = 'failed'
                row.message = save.message?.slice(0, 200) || 'Susulan file gagal'
              }
            }
          }
        } else {
          // 2. Sertifikat — generate bila belum
          let cert = row.sertifikat_id
            ? (await db.select().from(sertifikatWebinarTable).where(eq(sertifikatWebinarTable.id, row.sertifikat_id)).limit(1))[0]
            : (await db.select().from(sertifikatWebinarTable).where(and(eq(sertifikatWebinarTable.user_id, row.user_id), eq(sertifikatWebinarTable.webinar_id, webinarId))).limit(1))[0]
          if (!cert) {
            let nomor = (await db.select({ n: webinarParticipantsTable.nomor_sertifikat }).from(webinarParticipantsTable).where(and(eq(webinarParticipantsTable.user_id, row.user_id), eq(webinarParticipantsTable.webinar_id, webinarId))).limit(1))[0]?.n as unknown as string | null
            if (!nomor) {
              nomor = await sertifikatWebinarService.generateNomorSertifikat(webinarId)
              const [part] = await db.select().from(webinarParticipantsTable).where(and(eq(webinarParticipantsTable.user_id, row.user_id), eq(webinarParticipantsTable.webinar_id, webinarId))).limit(1)
              if (part) await db.update(webinarParticipantsTable).set({ nomor_sertifikat: nomor } as any).where(eq(webinarParticipantsTable.id, part.id))
            }
            cert = await sertifikatWebinarService.createOrUpdate(row.user_id, webinarId, nomor)
            row.cert_generated = true
            row.nomor_sertifikat = (cert as any).nomor_sertifikat
            row.sertifikat_id = (cert as any).id
          } else {
            row.nomor_sertifikat = (cert as any).nomor_sertifikat
            row.sertifikat_id = (cert as any).id
          }

          // 3. PDF asli — generate bila belum ada (memakai template yang sama seperti halaman sertifikat)
          let ensured = await siasnKursusService.getRealPdfBuffer(cert as any)
          if (!ensured) {
            const gen = await ensureWebinarCertificatePdf(webinarId, row.user_id)
            if (gen) ensured = { buffer: gen.buffer, fileName: gen.fileName }
          }
          row.has_pdf = !!ensured

          // 4. SIASN per NIP via API — data + file sekaligus bila PDF ada
          const payload = await siasnKursusService.buildPayloadFromWebinar(cert as any)
          if (!payload) {
            row.sync_result = 'failed'
            row.message = 'Gagal build payload (pnsOrangId kosong)'
          } else if (ensured) {
            const save = await siasnKursusService.postKursusDocumentSave(payload, ensured.buffer, ensured.fileName, { id: row.siasn_id_before || '' })
            await this.upsertSyncRow(row, payload, save, webinarId)
          } else {
            // PDF tetap gagal di-generate → kirim data dulu (tanpa fabricasi dokumen), file menyusul otomatis
            const save = await siasnKursusService.postKursusSave(payload)
            await this.upsertSyncRow(row, payload, save, webinarId, true)
          }
        }
      } catch (e: any) {
        row.sync_result = 'failed'
        row.message = e.message?.slice(0, 200) || 'Error'
      }
      const globalCurrent = offset + i + 1
      const percent = Math.round((globalCurrent / Math.max(total, 1)) * 100)
      if (onEvent) await onEvent({ current: globalCurrent, total, percent, row })
      if (i < rows.length - 1) await sleep(SIASN_DELAY_MS)
    }

    return { webinar: preview.webinar, rows, summary: this.summarize(rows), total, offset, limit, hasMore, nextOffset: offset + rows.length }
  }

  private async upsertSyncRow(row: BulkRow, payload: Record<string, any>, save: { ok: boolean; rwKursusId?: string; message?: string; raw?: any }, webinarId: number, dataOnly = false) {
    const { db: dbx } = await import('@/lib/db')
    const { siasnRiwayatSyncTable: t } = await import('@/lib/db/schema')
    const { eq: eqx, and: andx } = await import('drizzle-orm')
    const [user] = await dbx.select().from(usersTable).where(eqx(usersTable.id, row.user_id))
    const existing = await dbx.select().from(t).where(andx(eqx(t.user_id, row.user_id), eqx(t.sumber_type, 'webinar' as any), eqx(t.sumber_id, row.sertifikat_id!))).limit(1)
    const next = new Date(Date.now() + 5 * 60 * 1000)
    if (!save.ok) {
      try {
        const { insertKursusFallback } = await import('@/lib/db/simegilan')
        if (user) {
          await insertKursusFallback({
            nipBaru: user.nip,
            namaKursus: payload.namaKursus,
            penyelenggara: payload.institusiPenyelenggara,
            tanggalMulai: new Date().toISOString().slice(0, 10),
            tanggalSelesai: new Date().toISOString().slice(0, 10),
            noPiagam: payload.nomorSertipikat,
            tahun: payload.tahunKursus,
            lamaJam: payload.jumlahJam,
          })
        }
      } catch {}
      const vals = { payload: JSON.stringify(payload), status: 'queued_simegilan' as any, error_msg: save.message?.slice(0, 500), retry_count: ((existing[0] as any)?.retry_count || 0) + 1, next_retry_at: next }
      if (existing[0]) await dbx.update(t).set(vals).where(eqx(t.id, (existing[0] as any).id))
      else await dbx.insert(t).values({ user_id: row.user_id, nip: user?.nip || row.nip, sumber_type: 'webinar' as any, sumber_id: row.sertifikat_id!, nomor_sertifikat: payload.nomorSertipikat, ...vals } as any)
      row.sync_result = 'queued'
      row.message = save.message || 'SIASN down — antre Simegilan'
    } else {
      const rwId = save.rwKursusId || row.siasn_id_before || ''
      const vals = { payload: JSON.stringify({ ...payload, rwKursusId: rwId }), status: 'synced' as any, siasn_id: rwId, error_msg: (dataOnly ? `${FILE_PENDING_PREFIX} Data tersinkron, file PDF menyusul (belum di-generate)` : null) as any, synced_at: new Date(), next_retry_at: new Date() }
      if (existing[0]) await dbx.update(t).set(vals).where(eqx(t.id, (existing[0] as any).id))
      else await dbx.insert(t).values({ user_id: row.user_id, nip: user?.nip || row.nip, sumber_type: 'webinar' as any, sumber_id: row.sertifikat_id!, nomor_sertifikat: payload.nomorSertipikat, ...vals } as any)
      row.sync_result = dataOnly ? 'synced_data_only' : 'synced'
      row.siasn_id_after = rwId
      row.message = dataOnly ? `Data tersinkron (${rwId}), file menyusul` : `Tersinkron (${rwId}) + file`
    }
  }
}

export const siasnBulkService = new SiasnBulkService()
