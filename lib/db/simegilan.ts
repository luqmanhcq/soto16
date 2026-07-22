import postgres from 'postgres'

/**
 * Database connection to the `simegilan` database.
 * Used for SSO token validation and pegawai data lookup.
 *
 * This is a SEPARATE connection from the main `sisoto` database.
 * Both databases live on the same PostgreSQL server (localhost:5432).
 */
const simegilanUrl = process.env.SIMEGILAN_DATABASE_URL || 'postgresql://postgres:1453@localhost:5432/simegilan'

export const simegilanDb = postgres(simegilanUrl, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * Validate an SSO token from the sso_tokens table.
 * Returns the nip_baru if the token is valid, not expired, and not used.
 * Also marks the token as used (one-time use).
 */
export async function validateAndConsumeSsoToken(token: string): Promise<{ nipBaru: string } | null> {
  // Check token exists, not expired, not used
  const rows = await simegilanDb<{ nip_baru: string }[]>`
    SELECT nip_baru
    FROM sso_tokens
    WHERE token = ${token}
      AND is_used = 0
      AND expired_at > NOW()
  `

  if (rows.length === 0) {
    return null
  }

  const nipBaru = rows[0].nip_baru

  // Mark token as used (one-time use)
  await simegilanDb`
    UPDATE sso_tokens SET is_used = 1 WHERE token = ${token}
  `

  return { nipBaru }
}

/**
 * Get pegawai data by nip_baru from the simegilan database.
 */
export async function getPegawaiByNip(nipBaru: string): Promise<{
  nip_baru: string
  nama: string
  gelar_depan: string | null
  gelar_belakang: string | null
  email: string | null
  satker_id: string | null
  gol_akhir: string | null
  tipe_pegawai_id: string | null
  status_pegawai: string | null
} | null> {
  const rows = await simegilanDb`
    SELECT nip_baru, nama, gelar_depan, gelar_belakang,
           email, satker_id, gol_akhir, tipe_pegawai_id, status_pegawai
    FROM pegawai
    WHERE nip_baru = ${nipBaru}
    LIMIT 1
  `

  if (rows.length === 0) {
    return null
  }

  return rows[0] as any
}
