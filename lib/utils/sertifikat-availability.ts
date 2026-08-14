/**
 * Sertifikat ketersediaan window.
 *
 * Aturan:
 * - Sertifikat baru TERSEDIA setelah 24 jam (1x24 jam) sejak webinar selesai.
 * - Sertifikat hanya dapat diunduh dalam 24 jam setelah tersedia.
 */
export const SERTIFIKAT_AVAILABLE_AFTER_HOURS = 24
export const SERTIFIKAT_AVAILABLE_WINDOW_HOURS = 24

export type SertifikatAvailability = {
  /** Status ketersediaan saat ini */
  status: 'belum_selesai' | 'belum_tersedia' | 'tersedia' | 'kadaluarsa'
  /** Timestamp webinar selesai */
  selesaiAt: Date | null
  /** Timestamp mulai tersedia (selesai + 24 jam) */
  tersediaAt: Date | null
  /** Timestamp berakhir tersedia (tersedia + 24 jam) */
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
  const tersediaAt = new Date(selesaiAt.getTime() + SERTIFIKAT_AVAILABLE_AFTER_HOURS * 60 * 60 * 1000)
  const berakhirAt = new Date(tersediaAt.getTime() + SERTIFIKAT_AVAILABLE_WINDOW_HOURS * 60 * 60 * 1000)

  if (now < selesaiAt) {
    return {
      status: 'belum_selesai',
      selesaiAt,
      tersediaAt,
      berakhirAt,
      message: 'Sertifikat belum tersedia karena acara belum selesai.',
    }
  }

  if (now < tersediaAt) {
    return {
      status: 'belum_tersedia',
      selesaiAt,
      tersediaAt,
      berakhirAt,
      message: 'Sertifikat dapat diunduh mulai 24 jam setelah webinar selesai.',
    }
  }

  if (now > berakhirAt) {
    return {
      status: 'kadaluarsa',
      selesaiAt,
      tersediaAt,
      berakhirAt,
      message: 'Masa unduh sertifikat telah berakhir (tersedia selama 24 jam mulai 24 jam setelah webinar selesai).',
    }
  }

  return {
    status: 'tersedia',
    selesaiAt,
    tersediaAt,
    berakhirAt,
    message: 'Sertifikat dapat diunduh selama 24 jam mulai 24 jam setelah webinar selesai.',
  }
}
