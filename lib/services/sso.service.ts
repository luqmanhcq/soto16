import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { userRepository } from '@/lib/repositories/user.repository'
import { createToken } from '@/lib/jwt'
import { siasnService } from '@/lib/services/siasn.service'
import type { LoginResponseDto } from '@/types/dto'

export type SsoRole = 'asn' | 'admin' | 'super_admin'

/**
 * Response type from SiMEGILAN's Api::validate_token endpoint.
 * The API validates the one-time SSO token and returns pegawai data + role.
 */
type SsoTokenValidationData = {
  pegawai_id: string
  nip_lama: string
  nip_baru: string
  nama: string
  nama_lengkap: string
  status_pegawai: string
  status_pegawai_nama: string
  role: string // 'super_admin' | 'admin' | 'user'
}

export class SsoService {
  /**
   * Exchange OIDC Authorization Code for Access Token via /oauth/token,
   * then fetch user profile via /oauth/userinfo.
   */
  async exchangeOidcCode(code: string, origin?: string): Promise<SsoTokenValidationData> {
    const ssoBaseUrl = process.env.SSO_BASE_URL || 'https://simegilan.lamongankab.go.id'
    const tokenUrl = `${ssoBaseUrl}/oauth/token`
    const userinfoUrl = `${ssoBaseUrl}/oauth/userinfo`

    const clientId = process.env.OIDC_CLIENT_ID || 'corpu_app'
    const clientSecret = process.env.OIDC_CLIENT_SECRET || 'corpu_app_secret_key_2026'
    const redirectUri = process.env.OIDC_REDIRECT_URI || `${origin || 'https://corpu.lamongankab.go.id'}/api/auth/sso-callback`

    const params = new URLSearchParams()
    params.append('grant_type', 'authorization_code')
    params.append('code', code)
    params.append('redirect_uri', redirectUri)
    params.append('client_id', clientId)
    params.append('client_secret', clientSecret)

    // 1. Exchange Code -> Access Token
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || !tokenData.access_token) {
      const errDesc = tokenData.error_description || tokenData.error || 'Gagal menukar OIDC code'
      throw new Error(`OIDC Token Error: ${errDesc}`)
    }

    // 2. Fetch Userinfo via Bearer Access Token
    const userinfoRes = await fetch(userinfoUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    })

    const userinfoData = await userinfoRes.json()
    if (!userinfoRes.ok || !userinfoData.nip_baru) {
      throw new Error('Gagal mengambil data profil pengguna dari OIDC userinfo')
    }

    return {
      pegawai_id: String(userinfoData.pegawai_id || ''),
      nip_lama: String(userinfoData.nip_lama || ''),
      nip_baru: String(userinfoData.nip_baru || ''),
      nama: String(userinfoData.nama || ''),
      nama_lengkap: String(userinfoData.nama_lengkap || userinfoData.nama || ''),
      status_pegawai: String(userinfoData.status_pegawai || '1'),
      status_pegawai_nama: String(userinfoData.status_pegawai_nama || 'PNS'),
      role: String(userinfoData.role || 'user'),
    }
  }

  /**
   * Resolve the final role for a user.
   *
   * Priority:
   * 1. SSO_SUPER_ADMIN_NIPS env var → super_admin (override)
   * 2. SSO_ADMIN_NIPS env var → admin (override)
   * 3. Role from SiMEGILAN redirect URL (if provided)
   * 4. Role from SiMEGILAN API response (mapped: 'user' → 'asn')
   */
  private resolveRole(nip: string, apiRole: string, redirectRole?: string): SsoRole {
    // Check env var overrides first
    const superAdminNips = (process.env.SSO_SUPER_ADMIN_NIPS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const adminNips = (process.env.SSO_ADMIN_NIPS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (superAdminNips.includes(nip)) {
      return 'super_admin'
    }

    if (adminNips.includes(nip)) {
      return 'admin'
    }

    // Use role from SiMEGILAN redirect URL if provided
    if (redirectRole) {
      switch (redirectRole) {
        case 'super_admin':
          return 'super_admin'
        case 'admin':
          return 'admin'
      }
    }

    // Map role from SiMEGILAN API response
    switch (apiRole) {
      case 'super_admin':
        return 'super_admin'
      case 'admin':
        return 'admin'
      case 'user':
      default:
        return 'asn'
    }
  }

  /**
   * Build a properly formatted full name from the API response.
   *
   * The SiMEGILAN API returns:
   * - nama: plain name (e.g. "NAZARUDIN TRISTANTO")
   * - nama_lengkap: name + gelar, but often concatenated without separator
   *   (e.g. "NAZARUDIN TRISTANTOS.Kom" instead of "NAZARUDIN TRISTANTO, S.Kom")
   *
   * This method extracts the gelar from nama_lengkap and formats it correctly.
   */
  private buildNama(nama: string, namaLengkap: string): string {
    const plainNama = (nama || '').trim()
    const fullNama = (namaLengkap || '').trim()

    if (!fullNama) return plainNama
    if (!plainNama) return fullNama
    if (fullNama === plainNama) return plainNama

    // If nama_lengkap starts with nama, extract the gelar part
    if (fullNama.startsWith(plainNama)) {
      const gelar = fullNama.substring(plainNama.length).trim()
      if (gelar) {
        // Check if gelar already has a leading comma/space (properly formatted)
        if (/^[,\s]/.test(gelar)) {
          return `${plainNama}, ${gelar.replace(/^[,\s]+/, '')}`
        }
        // Gelar is concatenated without separator (e.g. "S.Kom")
        return `${plainNama}, ${gelar}`
      }
    }

    // If nama_lengkap doesn't start with nama, use it as-is
    return fullNama
  }

  /**
   * Main SSO authentication flow using OIDC Authorization Code.
   * Called by the /api/auth/sso-callback endpoint.
   */
  async authenticateWithOidcCode(code: string, origin?: string, redirectRole?: string): Promise<LoginResponseDto> {
    // 1. Exchange code via OIDC Token & Userinfo
    const pegawaiData = await this.exchangeOidcCode(code, origin)

    const nipBaru = pegawaiData.nip_baru
    const fullNama = this.buildNama(pegawaiData.nama, pegawaiData.nama_lengkap) || nipBaru
    const resolvedRole = this.resolveRole(nipBaru, pegawaiData.role, redirectRole)

    // 2. Find or create user in SI-SOTO
    const existingUser = await userRepository.findByNip(nipBaru)

    // Generate fallback email (API doesn't return email field)
    const email = existingUser?.email || `${nipBaru}@soto.lokermegilan.my.id`

    let user
    if (existingUser) {
      // Update user's nama and role from SiMEGILAN API response
      // (SiMEGILAN is the source of truth for roles)
      user = await userRepository.updateById(existingUser.id, {
        nama: fullNama,
        role: resolvedRole,
      })
    } else {
      // Create new SSO user with a random password (can't login via password form)
      const randomPassword = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 10)
      user = await userRepository.create({
        nip: nipBaru,
        nama: fullNama,
        email: email,
        password: randomPassword,
      })

      // Set the resolved role (create defaults to 'asn', so update if different)
      if (resolvedRole !== 'asn') {
        user = await userRepository.updateById(user.id, { role: resolvedRole })
      }
    }

    if (!user) {
      throw new Error('Gagal membuat atau memperbarui user')
    }

    // 3. Sync ASN data — FULL dari simegilan.siasn_data_utama (lokal).
    // Tidak lagi tergantung API BKN saat login, sehingga API down bukan kendala.
    if (siasnService.needsAsnData(user)) {
      console.log('[SSO] User needs ASN data sync, loading from simegilan data utama...')
      await siasnService.syncAsnData(user.id, user.nip)
      // Re-fetch user to get updated data
      const updatedUser = await userRepository.findById(user.id)
      if (updatedUser) {
        user = updatedUser
      }
    }

    // 4. Issue JWT
    const jwtToken = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      token: jwtToken,
      user: {
        id: user.id,
        nip: user.nip,
        nama: user.nama,
        email: user.email,
        jabatan: user.jabatan,
        golongan: user.golongan,
        unit_kerja: user.unit_kerja,
        role: user.role,
      },
    }
  }

  /**
   * Get the SiMEGILAN SSO login URL.
   * Used by the login page to redirect users to SiMEGILAN login.
   */
  getSsoLoginUrl(callbackUrl: string): string {
    const ssoBaseUrl = process.env.SSO_BASE_URL || 'https://simegilan.lamongankab.go.id'
    return `${ssoBaseUrl}/login?redirect_uri=${encodeURIComponent(callbackUrl)}`
  }

  /**
   * Get the SiMEGILAN redirect URL after logout.
   * Redirects to the SiMEGILAN homepage so the user stays logged in there
   * and can seamlessly access SI-SOTO again without re-entering credentials.
   */
  getSsoLogoutUrl(): string {
    const ssoBaseUrl = process.env.SSO_BASE_URL || 'https://simegilan.lamongankab.go.id'
    return ssoBaseUrl
  }
}

export const ssoService = new SsoService()
