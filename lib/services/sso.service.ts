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
   * Call SiMEGILAN's Api::validate_token endpoint to validate the SSO token.
   * This exchanges the one-time token for pegawai data + role.
   * The API also marks the token as used (one-time use).
   *
   * Endpoint: POST {SSO_BASE_URL}/api/validate_token
   * Body: { "token": "xxx" }
   * Response: { status: "success", data: { nip_baru, nama, nama_lengkap, role, ... } }
   */
  private async validateTokenViaApi(token: string): Promise<SsoTokenValidationData> {
    const ssoBaseUrl = process.env.SSO_BASE_URL || 'https://simegilan.lamongankab.go.id'
    const apiUrl = `${ssoBaseUrl}/api/validate_token`

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    const result = await res.json()

    if (!res.ok || result.status !== 'success' || !result.data) {
      throw new Error(result.message || 'Token SSO tidak valid atau sudah kadaluarsa')
    }

    return result.data as SsoTokenValidationData
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
   * Main SSO authentication flow.
   * Called by the /api/auth/sso-callback endpoint.
   *
   * Flow:
   * 1. Call SiMEGILAN's Api::validate_token to validate token + get pegawai data + role
   *    (the API also consumes/marks the token as used)
   * 2. Resolve the final role (env var overrides take priority over API role)
   * 3. Find or create user in sisoto.users table
   *    - If exists: update nama and role from SiMEGILAN API response
   *    - If new: create with resolved role
   * 4. Issue JWT token
   */
  async authenticateWithSsoToken(token: string, redirectRole?: string): Promise<LoginResponseDto> {
    // 1. Validate token via SiMEGILAN API (also consumes the token)
    const pegawaiData = await this.validateTokenViaApi(token)

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

    // 3. Sync ASN data from SIASN BKN API (only if jabatan/golongan/unit_kerja is empty)
    if (siasnService.needsAsnData(user)) {
      console.log('[SSO] User needs ASN data sync, calling SIASN API...')
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
