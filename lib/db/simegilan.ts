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

/**
 * Fallback: ambil mirror SIASN dari tabel siasn_data_utama (9921 row).
 * Dipakai saat apimws.bkn.go.id down / timeout.
 */
export async function getSiasnDataUtamaByNip(nipBaru: string): Promise<Record<string, any> | null> {
  const rows = await simegilanDb`
    SELECT * FROM siasn_data_utama WHERE nipbaru = ${nipBaru} LIMIT 1
  `
  if (rows.length === 0) return null
  const r: any = rows[0]
  // normalisasi ke camelCase yang dipakai siasn.service.ts
  return {
    jabatanNama: r.jabatannama || r.jabatan_nama || '',
    jabatanStrukturalNama: r.jabatanstrukturalnama || '',
    jabatanFungsionalNama: r.jabatanfungsionalnama || '',
    jabatanFungsionalUmumNama: r.jabatanfungsionalumumnama || '',
    golRuangAkhir: r.golruangakhir || r.gol_akhir || '',
    golRuangAwal: r.golruangawal || '',
    unorNama: r.unornama || '',
    unorIndukNama: r.unorinduknama || '',
    instansiIndukNama: r.instansiinduknama || '',
    satuanKerjaKerjaNama: r.satuankerjakerjanama || '',
    satuanKerjaIndukNama: r.satuankerjainduknama || '',
    instansiKerjaNama: r.instansikerjanama || '',
    pnsOrangId: r.id_asn || r.pns_id || '',
    instansiId: r.instansiindukid || r.instansikerjaid || '',
    lokasiId: r.lokasikerjaid || '',
    unorId: r.unorid || '',
    raw: r,
  }
}

/**
 * Fallback jabatan dari pegawai_jabatan_terakhir_riwayat
 */
export async function getJabatanTerakhirByNip(nipBaru: string): Promise<string | null> {
  const rows = await simegilanDb`
    SELECT r.jabatan_terakhir FROM pegawai p
    JOIN pegawai_jabatan_terakhir_riwayat r ON r.pegawai_id = p.pegawai_id
    WHERE p.nip_baru = ${nipBaru} LIMIT 1
  `
  if (rows.length === 0) return null
  return (rows[0] as any).jabatan_terakhir || null
}

/**
 * Fallback kursus lokal: tulis antrean ke tabel kursus simegilan saat SIASN down
 * (struktur: pegawai_id, nama, penyelenggara, tanggal_mulai/selesai, no_piagam, tahun, lama)
 */
export async function insertKursusFallback(params: {
  nipBaru: string
  namaKursus: string
  penyelenggara: string
  tanggalMulai: string
  tanggalSelesai: string
  noPiagam: string
  tahun: number
  lamaJam: number
}): Promise<number | null> {
  try {
    const pegawai = await simegilanDb`SELECT pegawai_id FROM pegawai WHERE nip_baru = ${params.nipBaru} LIMIT 1`
    if (pegawai.length === 0) return null
    const pegawaiId = (pegawai[0] as any).pegawai_id
    // kursus_id NUMERIC tanpa sequence/default (pola legacy: MAX+1 dalam satu statement)
    const res = await simegilanDb`
      INSERT INTO kursus (kursus_id, pegawai_id, nama, penyelenggara, tanggal_mulai, tanggal_selesai, no_piagam, tahun, lama, tipe)
      SELECT COALESCE(MAX(kursus_id), 0) + 1, ${pegawaiId}, ${params.namaKursus}, ${params.penyelenggara}, ${params.tanggalMulai}::date, ${params.tanggalSelesai}::date, ${params.noPiagam}, ${String(params.tahun)}, ${String(params.lamaJam)}, '8'
      FROM kursus
      RETURNING kursus_id
    `
    return (res[0] as any)?.kursus_id || null
  } catch (e) {
    console.error('[simegilan] insertKursusFallback failed', e)
    return null
  }
}
