import { userRepository } from '@/lib/repositories/user.repository'

/**
 * SIASN BKN API Service
 *
 * Fetches ASN master data (jabatan, golongan, unit kerja) from BKN's SIASN API.
 * Uses two authentication mechanisms:
 * 1. Static Bearer Token (SIASN JWT)
 * 2. Dynamic OAuth2 Token (client credentials from BKN API Manager)
 *
 * Data is only fetched when user's jabatan, golongan, or unit_kerja is empty.
 */

type OauthTokenCache = {
  token: string
  expiresAt: number
}

type SiasnDataUtamaResponse = {
  code?: number | string
  data?: Record<string, unknown>
  message?: string
  response?: {
    status?: string
    data?: Record<string, unknown>
    message?: string
  }
}

export class SiasnService {
  private oauthTokenCache: OauthTokenCache | null = null

  /**
   * Get OAuth2 access token from BKN API Manager.
   * Uses HTTP Basic auth with client credentials.
   * Caches the token until it expires (with 60s buffer).
   */
  private async getOAuthToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.oauthTokenCache && Date.now() < this.oauthTokenCache.expiresAt - 60000) {
      return this.oauthTokenCache.token
    }

    const oauthUrl = process.env.SIASN_OAUTH_URL
    const clientId = process.env.SIASN_CLIENT_ID
    const clientSecret = process.env.SIASN_CLIENT_SECRET

    if (!oauthUrl || !clientId || !clientSecret) {
      throw new Error('SIASN OAuth credentials not configured')
    }

    // HTTP Basic auth: base64(client_id:client_secret)
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const res = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`SIASN OAuth token request failed (${res.status}): ${text}`)
    }

    const result = await res.json()

    if (!result.access_token) {
      throw new Error('SIASN OAuth response missing access_token')
    }

    // Cache the token (expires_in is in seconds)
    const expiresIn = result.expires_in || 3600
    this.oauthTokenCache = {
      token: result.access_token,
      expiresAt: Date.now() + expiresIn * 1000,
    }

    console.log('[SIASN] OAuth token obtained, expires in', expiresIn, 'seconds')
    return result.access_token
  }

  /**
   * Fetch data utama (master ASN data) from SIASN API.
   * Endpoint: GET {SIASN_API_URL}/{NIP}
   *
   * Sends both authentication tokens:
   * - Authorization: Bearer <static_token>
   * - The OAuth2 token is included for API Manager validation
   */
  private async fetchDataUtama(nip: string): Promise<Record<string, unknown>> {
    const staticToken = process.env.SIASN_STATIC_TOKEN
    const apiUrl = process.env.SIASN_API_URL

    if (!staticToken || !apiUrl) {
      throw new Error('SIASN API credentials not configured')
    }

    // Get OAuth2 token
    const oauthToken = await this.getOAuthToken()

    const url = `${apiUrl}/${nip}`

    console.log('[SIASN] Fetching data utama for NIP:', nip)

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Auth': `bearer ${staticToken}`,
        'Authorization': `Bearer ${oauthToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`SIASN API request failed (${res.status}): ${text}`)
    }

    const result: SiasnDataUtamaResponse = await res.json()

    // The BKN SIASN data-utama endpoint returns:
    //   { "code": 1, "data": { ... }, "message": ... }
    // where code === 1 means success. Some variants use response.status === '01'.
    const success =
      result.code === 1 ||
      result.code === '1' ||
      result.code === 200 ||
      result.response?.status === '01' ||
      result.response?.status === '200'

    if (!success) {
      const msg =
        result.message ||
        result.response?.message ||
        `SIASN API returned code: ${result.code ?? result.response?.status ?? 'unknown'}`
      throw new Error(`SIASN API returned error: ${msg}`)
    }

    const rawData = result.data || result.response?.data || {}

    // Log the response structure for debugging field mapping
    if (rawData) {
      console.log('[SIASN] Data utama response keys:', Object.keys(rawData))
    }

    return rawData
  }

  /**
   * Check if a user needs ASN data sync.
   * Returns true if jabatan, golongan, or unit_kerja is null/empty.
   */
  needsAsnData(user: { jabatan: string | null; golongan: string | null; unit_kerja: string | null }): boolean {
    return !user.jabatan || !user.golongan || !user.unit_kerja
  }

  /**
   * Sync ASN data from SIASN API and update user record.
   * Only fetches if user's jabatan/golongan/unit_kerja is incomplete.
   *
   * Returns the updated user data or null if sync was skipped/failed.
   */
  async syncAsnData(userId: number, nip: string): Promise<{ jabatan: string; golongan: string; unit_kerja: string } | null> {
    try {
      // Check if user already has complete data
      const user = await userRepository.findById(userId)
      if (!user) {
        console.warn('[SIASN] User not found for sync:', userId)
        return null
      }

      if (!this.needsAsnData(user)) {
        console.log('[SIASN] User already has complete ASN data, skipping sync')
        return null
      }

      // Fetch data from SIASN
      const data = await this.fetchDataUtama(nip)

      // Map SIASN response to user fields
      // The BKN SIASN data-utama endpoint returns camelCase fields:
      // - jabatan:    jabatanNama, jabatanStrukturalNama, jabatanFungsionalNama, jabatanFungsionalUmumNama
      // - golongan:   golRuangAkhir, golRuangAwal (e.g. "II/c", "IV/b")
      // - unit_kerja: unorNama, unorIndukNama, satuanKerjaKerjaNama, satuanKerjaIndukNama
      // (snake_case fallbacks kept for compatibility with other SIASN variants)
      const jabatan = String(
        data.jabatanNama ||
          data.jabatanStrukturalNama ||
          data.jabatanFungsionalNama ||
          data.jabatanFungsionalUmumNama ||
          data.nama_jabatan ||
          data.jabatan ||
          data.jabatan_nama ||
          ''
      ).trim()
      const golongan = String(
        data.golRuangAkhir ||
          data.golRuangAwal ||
          data.nama_pangkat ||
          data.pangkat ||
          data.golongan_nama ||
          data.tingkat_pendidikan ||
          ''
      ).trim()

      const unorNama = String(
        data.unorNama ||
          data.nama_unit_kerja ||
          data.unit_kerja ||
          data.satuan_kerja_nama ||
          ''
      ).trim()
      const unorIndukNama = String(data.unorIndukNama || '').trim()
      const instansiNama = String(
        data.instansiIndukNama ||
          data.satuanKerjaIndukNama ||
          data.instansiKerjaNama ||
          data.satuanKerjaKerjaNama ||
          data.instansi_nama ||
          ''
      ).trim()

      const normalizeNama = (s: string) =>
        s.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim()

      const isUnorIndukKabupatenLamongan =
        !unorIndukNama ||
        (instansiNama && normalizeNama(unorIndukNama) === normalizeNama(instansiNama)) ||
        /pemerintah\s+kab(\.|upaten)?\s*\.?\s*lamongan/i.test(unorIndukNama)

      let unitKerja = unorNama
      if (unorNama && unorIndukNama && !isUnorIndukKabupatenLamongan) {
        unitKerja = `${unorNama} - ${unorIndukNama}`
      }

      console.log('[SIASN] Mapped data:', { jabatan, golongan, unitKerja, unorNama, unorIndukNama, instansiNama })

      // Only update fields that have values
      const updateData: Record<string, string> = {}
      if (jabatan && !user.jabatan) updateData.jabatan = jabatan
      if (golongan && !user.golongan) updateData.golongan = golongan
      if (unitKerja && !user.unit_kerja) updateData.unit_kerja = unitKerja

      if (Object.keys(updateData).length === 0) {
        console.log('[SIASN] No new data to update for user:', userId)
        return null
      }

      // Update user record
      const updatedUser = await userRepository.updateById(userId, updateData)
      if (!updatedUser) {
        console.error('[SIASN] Failed to update user:', userId)
        return null
      }

      console.log('[SIASN] Successfully synced ASN data for user:', userId, updateData)

      return {
        jabatan: updatedUser.jabatan || '',
        golongan: updatedUser.golongan || '',
        unit_kerja: updatedUser.unit_kerja || '',
      }
    } catch (error) {
      // Log error but don't throw - SIASN sync failure should not block login
      console.error('[SIASN] Sync failed:', error instanceof Error ? error.message : error)
      return null
    }
  }
}

export const siasnService = new SiasnService()
