/**
 * Sertifikat ketersediaan.
 *
 * Aturan:
 * - Sertifikat langsung TERSEDIA begitu webinar selesai (tanpa jeda 1x24 jam).
 * - Tidak ada batas waktu unduh (tersedia selamanya setelah webinar selesai).
 */
export const SERTIFIKAT_AVAILABLE_AFTER_HOURS = 0

export type SertifikatAvailability = {
  /** Status ketersediaan saat ini */
  status: 'belum_selesai' | 'tersedia'
  /** Timestamp webinar selesai */
  selesaiAt: Date | null
  /** Timestamp mulai tersedia (sama dengan waktu selesai) */
  tersediaAt: Date | null
  /** Timestamp berakhir tersedia (selalu null karena tidak ada batas waktu) */
  berakhirAt: Date | null
  /** Message deskriptif untuk UI */
  message: string
}

export function getSertifikatAvailability(tanggalSelesai: string | Date | null): SertifikatAvailability {
  const now = new Date()

  if (!tanggalSelesai) {
    return {
      status: 'belum_selesai',
      selesaiAt: null,
      tersediaAt: null,
      berakhirAt: null,
      message: 'Tanggal selesai webinar belum ditentukan.',
    }
  }

  const selesaiAt = new Date(tanggalSelesai)

  if (now < selesaiAt) {
    return {
      status: 'belum_selesai',
      selesaiAt,
      tersediaAt: selesaiAt,
      berakhirAt: null,
      message: 'Sertifikat belum tersedia karena acara belum selesai.',
    }
  }

  return {
    status: 'tersedia',
    selesaiAt,
    tersediaAt: selesaiAt,
    berakhirAt: null,
    message: 'Sertifikat siap diunduh.',
  }
}
