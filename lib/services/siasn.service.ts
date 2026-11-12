import { userRepository } from '@/lib/repositories/user.repository'
import { db } from '@/lib/db'
import { siasnCacheTable, siasnSyncQueueTable } from '@/lib/db/schema'

/**
 * SIASN BKN API Service — dengan resilience:
 * - Timeout 7s, CircuitBreaker, fallback ke simegilan.siasn_data_utama, queue retry
 */

type OauthTokenCache = { token: string; expiresAt: number }
type SiasnDataUtamaResponse = {
  code?: number | string
  data?: Record<string, unknown>
  message?: string
  response?: { status?: string; data?: Record<string, unknown>; message?: string }
}

export class SiasnService {
  private oauthTokenCache: OauthTokenCache | null = null
  // Circuit breaker
  private consecutiveFails = 0
  private circuitOpenUntil = 0
  private readonly circuitThreshold = 3
  private readonly circuitOpenMs = 5 * 60 * 1000

  private isCircuitOpen(): boolean {
    return Date.now() < this.circuitOpenUntil
  }
  private recordSuccess() {
    this.consecutiveFails = 0
    this.circuitOpenUntil = 0
  }
  private recordFailure() {
    this.consecutiveFails++
    if (this.consecutiveFails >= this.circuitThreshold) {
      this.circuitOpenUntil = Date.now() + this.circuitOpenMs
      console.warn('[SIASN] Circuit OPEN for', this.circuitOpenMs / 1000, 's')
    }
  }

  private async getOAuthToken(): Promise<string> {
    if (this.oauthTokenCache && Date.now() < this.oauthTokenCache.expiresAt - 60000) {
      return this.oauthTokenCache.token
    }
    const oauthUrl = process.env.SIASN_OAUTH_URL
    const clientId = process.env.SIASN_CLIENT_ID
    const clientSecret = process.env.SIASN_CLIENT_SECRET
    if (!oauthUrl || !clientId || !clientSecret) throw new Error('SIASN OAuth credentials not configured')
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const res = await fetch(oauthUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${credentials}` },
      body: 'grant_type=client_credentials',
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`SIASN OAuth token request failed (${res.status}): ${text}`)
    }
    const result = await res.json()
    if (!result.access_token) throw new Error('SIASN OAuth response missing access_token')
    const expiresIn = result.expires_in || 3600
    this.oauthTokenCache = { token: result.access_token, expiresAt: Date.now() + expiresIn * 1000 }
    console.log('[SIASN] OAuth token obtained, expires in', expiresIn, 'seconds')
    return result.access_token
  }

  private async fetchDataUtama(nip: string): Promise<Record<string, unknown>> {
    if (this.isCircuitOpen()) throw new Error('SIASN circuit OPEN — skip live call')
    const staticToken = process.env.SIASN_STATIC_TOKEN
    const apiUrl = process.env.SIASN_API_URL
    if (!staticToken || !apiUrl) throw new Error('SIASN API credentials not configured')
    const oauthToken = await this.getOAuthToken()
    const url = `${apiUrl}/${nip}`
    console.log('[SIASN] Fetching data utama for NIP:', nip)
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 7000)
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Auth: `bearer ${staticToken}`,
          Authorization: `Bearer ${oauthToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`SIASN API request failed (${res.status}): ${text}`)
      }
      const result: SiasnDataUtamaResponse = await res.json()
      const success =
        result.code === 1 ||
        result.code === '1' ||
        result.code === 200 ||
        result.response?.status === '01' ||
        result.response?.status === '200'
      if (!success) {
        const msg = result.message || result.response?.message || `SIASN API returned code: ${result.code ?? result.response?.status ?? 'unknown'}`
        throw new Error(`SIASN API returned error: ${msg}`)
      }
      const rawData = result.data || result.response?.data || {}
      if (rawData) console.log('[SIASN] Data utama response keys:', Object.keys(rawData))
      this.recordSuccess()
      return rawData
    } finally {
      clearTimeout(t)
    }
  }

  needsAsnData(user: { jabatan: string | null; golongan: string | null; unit_kerja: string | null }): boolean {
    return !user.jabatan || !user.golongan || !user.unit_kerja
  }

  private mapSiasnToUserFields(data: Record<string, unknown>) {
    const jabatan = String(
      data.jabatanNama || data.jabatanStrukturalNama || data.jabatanFungsionalNama || data.jabatanFungsionalUmumNama || data.nama_jabatan || data.jabatan || data.jabatan_nama || '',
    ).trim()
    const golongan = String(data.golRuangAkhir || data.golRuangAwal || data.nama_pangkat || data.pangkat || data.golongan_nama || data.tingkat_pendidikan || '').trim()
    const unorNama = String(data.unorNama || data.nama_unit_kerja || data.unit_kerja || data.satuan_kerja_nama || '').trim()
    const unorIndukNama = String(data.unorIndukNama || '').trim()
    const instansiNama = String(data.instansiIndukNama || data.satuanKerjaIndukNama || data.instansiKerjaNama || data.satuanKerjaKerjaNama || data.instansi_nama || '').trim()
    const normalizeNama = (s: string) => s.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim()
    const isUnorIndukKabupatenLamongan =
      !unorIndukNama || (instansiNama && normalizeNama(unorIndukNama) === normalizeNama(instansiNama)) || /pemerintah\s+kab(\.|upaten)?\s*\.?\s*lamongan/i.test(unorIndukNama)
    let unitKerja = unorNama
    if (unorNama && unorIndukNama && !isUnorIndukKabupatenLamongan) unitKerja = `${unorNama} - ${unorIndukNama}`
    return { jabatan, golongan, unitKerja, unorNama, unorIndukNama, instansiNama, unorId: String(data.unorId || ''), instansiId: String(data.instansiIndukId || data.instansiKerjaId || ''), pnsOrangId: String(data.id_asn || (data as any).pnsOrangId || '') }
  }

  /**
   * Ambil data ASN full dari simegilan.siasn_data_utama (lokal, cepat, tidak tergantung API BKN).
   * Return null jika tidak ketemu.
   */
  private async fetchFromSimegilan(nip: string): Promise<{ data: Record<string, unknown>; sumber: string } | null> {
    try {
      const { getSiasnDataUtamaByNip, getJabatanTerakhirByNip, getPegawaiByNip } = await import('@/lib/db/simegilan')
      const fb = await getSiasnDataUtamaByNip(nip)
      if (fb && (fb.jabatanNama || fb.golRuangAkhir || fb.unorNama)) {
        console.log('[SIASN] Simegilan data utama found for', nip)
        return { data: fb, sumber: 'simegilan' }
      }
      const peg = await getPegawaiByNip(nip)
      const jab = await getJabatanTerakhirByNip(nip)
      if (peg || jab) {
        console.log('[SIASN] Simegilan pegawai/jabatan found for', nip)
        return {
          data: {
            jabatanNama: jab || '',
            golRuangAkhir: (peg as any)?.gol_akhir || '',
            unorNama: '',
            unorIndukNama: '',
          },
          sumber: 'simegilan_pegawai',
        }
      }
    } catch (e) {
      console.error('[SIASN] Simegilan fetch failed', e)
    }
    return null
  }

  async syncAsnData(userId: number, nip: string): Promise<{ jabatan: string; golongan: string; unit_kerja: string } | null> {
    try {
      const user = await userRepository.findById(userId)
      if (!user) {
        console.warn('[SIASN] User not found for sync:', userId)
        return null
      }
      if (!this.needsAsnData(user)) {
        console.log('[SIASN] User already has complete ASN data, skipping sync')
        return null
      }
      // STRATEGY: Simegilan-first — full akses ke simegilan.siasn_data_utama.
      // API BKN hanya dipakai jika simegilan kosong (background refresh via cron).
      // Sehingga login TIDAK PERNAH terkendala saat api siasn down.
      let data: Record<string, unknown> | null = null
      let sumber: string = 'simegilan'
      const local = await this.fetchFromSimegilan(nip)
      if (local) {
        data = local.data
        sumber = local.sumber
      } else {
        // simegilan kosong → coba API live sekali (dengan circuit breaker + timeout)
        try {
          data = await this.fetchDataUtama(nip)
          sumber = 'siasn'
        } catch (liveErr) {
          this.recordFailure()
          console.warn('[SIASN] Simegilan kosong + live failed:', (liveErr as Error).message)
          await this.enqueueAsnSync(userId, nip, String(liveErr instanceof Error ? liveErr.message : liveErr))
          return null
        }
      }

      const mapped = this.mapSiasnToUserFields(data!)
      console.log('[SIASN] Mapped data:', mapped, 'sumber=', sumber)

      // simpan cache
      try {
        await db.insert(siasnCacheTable).values({
          nip,
          jabatan: mapped.jabatan || null,
          golongan: mapped.golongan || null,
          unit_kerja: mapped.unitKerja || null,
          unor_id: mapped.unorId || null,
          instansi_id: mapped.instansiId || null,
          pns_orang_id: mapped.pnsOrangId || null,
          raw_json: JSON.stringify(data),
          sumber,
        }).onConflictDoUpdate({ target: siasnCacheTable.nip, set: { jabatan: mapped.jabatan || null, golongan: mapped.golongan || null, unit_kerja: mapped.unitKerja || null, raw_json: JSON.stringify(data), sumber, updated_at: new Date() } as any })
      } catch {}

      const updateData: Record<string, any> = {}
      if (mapped.jabatan && !user.jabatan) updateData.jabatan = mapped.jabatan
      if (mapped.golongan && !user.golongan) updateData.golongan = mapped.golongan
      if (mapped.unitKerja && !user.unit_kerja) updateData.unit_kerja = mapped.unitKerja
      if (Object.keys(updateData).length === 0) {
        console.log('[SIASN] No new data to update for user:', userId)
        // tetap tandai synced agar tidak loop
        await userRepository.updateById(userId, { asn_source: sumber, asn_sync_status: 'synced', asn_last_sync_at: new Date() } as any)
        return null
      }
      const updatedUser = await userRepository.updateById(userId, { ...updateData, asn_source: sumber, asn_sync_status: 'synced', asn_last_sync_at: new Date() } as any)
      if (!updatedUser) {
        console.error('[SIASN] Failed to update user:', userId)
        return null
      }
      console.log('[SIASN] Successfully synced ASN data for user:', userId, updateData, 'sumber', sumber)
      return { jabatan: updatedUser.jabatan || '', golongan: updatedUser.golongan || '', unit_kerja: updatedUser.unit_kerja || '' }
    } catch (error) {
      console.error('[SIASN] Sync failed:', error instanceof Error ? error.message : error)
      return null
    }
  }

  private async enqueueAsnSync(userId: number, nip: string, err: string) {
    try {
      const next = new Date(Date.now() + 5 * 60 * 1000)
      await db.insert(siasnSyncQueueTable).values({ user_id: userId, nip, jenis: 'asn_data', status: 'pending', retry_count: 0, next_retry_at: next, last_error: err.slice(0, 500) })
      await userRepository.updateById(userId, { asn_sync_status: 'pending' } as any)
      console.log('[SIASN] Enqueued retry for', nip, 'next', next.toISOString())
    } catch (e) {
      console.error('[SIASN] enqueue failed', e)
    }
  }

  // dipakai cron untuk retry
  async retryPendingQueue(limit = 20): Promise<number> {
    const pending = await db.select().from(siasnSyncQueueTable).where((await import('drizzle-orm')).eq(siasnSyncQueueTable.status, 'pending' as any)).limit(limit) as any
    // filter next_retry_at < now in js (avoid sql now issues)
    const now = new Date()
    let done = 0
    for (const row of pending) {
      if (new Date(row.next_retry_at) > now) continue
      const res = await this.syncAsnData(row.user_id, row.nip)
      if (res) {
        await db.update(siasnSyncQueueTable).set({ status: 'synced' as any, last_error: null as any }).where((await import('drizzle-orm')).eq(siasnSyncQueueTable.id, row.id))
        done++
      } else {
        const nextCount = (row.retry_count || 0) + 1
        if (nextCount >= 5) {
          await db.update(siasnSyncQueueTable).set({ status: 'failed' as any, retry_count: nextCount }).where((await import('drizzle-orm')).eq(siasnSyncQueueTable.id, row.id))
        } else {
          const delays = [5, 30, 120, 720, 1440] // minutes
          const next = new Date(Date.now() + delays[Math.min(nextCount, delays.length - 1)] * 60 * 1000)
          await db.update(siasnSyncQueueTable).set({ retry_count: nextCount, next_retry_at: next }).where((await import('drizzle-orm')).eq(siasnSyncQueueTable.id, row.id))
        }
      }
    }
    return done
  }

  // helper untuk ambil pnsOrangId — Simegilan-first (tidak tergantung API saat login)
  async getPnsOrangId(nip: string): Promise<string | null> {
    try {
      const { getSiasnDataUtamaByNip } = await import('@/lib/db/simegilan')
      const fb = await getSiasnDataUtamaByNip(nip)
      if (fb?.pnsOrangId) return fb.pnsOrangId
      if ((fb as any)?.raw?.id_asn) return (fb as any).raw.id_asn
    } catch {}
    try {
      const [c] = await db.select().from(siasnCacheTable).where((await import('drizzle-orm')).eq(siasnCacheTable.nip, nip)).limit(1) as any
      if (c?.pns_orang_id) return c.pns_orang_id
    } catch {}
    // terakhir: API live (hanya jika lokal kosong)
    try {
      const data = await this.fetchDataUtama(nip)
      const m = this.mapSiasnToUserFields(data)
      if (m.pnsOrangId) return m.pnsOrangId
    } catch {}
    return null
  }

  /**
   * Background refresh dari API BKN ke cache/simegilan mirror.
   * Dipakai cron, BUKAN login — agar login tetap full-lokal.
   */
  async refreshFromApi(nip: string): Promise<boolean> {
    try {
      const data = await this.fetchDataUtama(nip)
      const mapped = this.mapSiasnToUserFields(data)
      await db.insert(siasnCacheTable).values({
        nip,
        jabatan: mapped.jabatan || null,
        golongan: mapped.golongan || null,
        unit_kerja: mapped.unitKerja || null,
        unor_id: mapped.unorId || null,
        instansi_id: mapped.instansiId || null,
        pns_orang_id: mapped.pnsOrangId || null,
        raw_json: JSON.stringify(data),
        sumber: 'siasn',
      }).onConflictDoUpdate({ target: siasnCacheTable.nip, set: { jabatan: mapped.jabatan || null, golongan: mapped.golongan || null, unit_kerja: mapped.unitKerja || null, raw_json: JSON.stringify(data), sumber: 'siasn', updated_at: new Date() } as any })
      return true
    } catch {
      return false
    }
  }
}

export const siasnService = new SiasnService()
