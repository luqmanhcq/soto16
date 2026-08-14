import { db } from '@/lib/db'
import { sertifikatWebinarTable, webinarsTable, usersTable } from '@/lib/db/schema'
import { eq, and, sql, type SQL } from 'drizzle-orm'

export class SertifikatWebinarService {
  /**
   * Generate nomor sertifikat dengan format:
   *   800.2.2/DRJT.ASN-{counter}/413.204/{tahun}
   *
   * Aturan penomoran:
   * - Tahun diambil dari tahun webinar dilaksanakan (tanggal_mulai webinar).
   * - Counter dimulai dari 1472 pada tahun pertama sistem digunakan,
   *   lalu naik terus sampai tahun berganti.
   * - Saat tahun berganti, counter di-reset mulai dari 1.
   */
  async generateNomorSertifikat(webinarId: number): Promise<string> {
    // Tahun dari webinar (bukan tahun generate)
    const [webinar] = await db.select({
      tanggal_mulai: webinarsTable.tanggal_mulai,
    }).from(webinarsTable).where(eq(webinarsTable.id, webinarId))

    const year = webinar?.tanggal_mulai
      ? new Date(webinar.tanggal_mulai).getFullYear()
      : new Date().getFullYear()

    // Ambil tahun terkecil yang pernah tercatat di nomor_sertifikat
    // (nomor_sertifikat format: 800.2.2/DRJT.ASN-{counter}/413.204/{tahun})
    const yearRows = await db.execute(sql`
      SELECT DISTINCT
        CAST(SUBSTRING(nomor_sertifikat FROM '/413\.204/(\\d{4})$') AS INTEGER) AS y
      FROM sertifikat_webinar
      WHERE nomor_sertifikat ~ '^800\.2\.2/DRJT\.ASN-\\d+/413\.204/\\d{4}$'
      ORDER BY y ASC
    `)
    const years: number[] = (yearRows as unknown as Array<{ y: string }>).map((r) => Number(r.y))

    // Tahun pertama sistem = tahun terkecil yang pernah tercatat di nomor_sertifikat
    // (atau tahun target jika kosong)
    const firstYear = years.length > 0 ? years[0] : year

    // Base counter: tahun pertama mulai 1472, tahun berikutnya reset ke 1
    const baseCounter = year === firstYear ? 1472 : 1

    const counter = await db.execute(sql`
      SELECT COALESCE(MAX(
        CAST(
          REGEXP_REPLACE(
            SUBSTRING(nomor_sertifikat FROM 'DRJT\\.ASN-(\\d+)/'),
            '[^0-9]', '', 'g'
          ) AS INTEGER
        )
      ), 0) as max_counter
      FROM sertifikat_webinar
      WHERE nomor_sertifikat LIKE ${`%/${year}`}
    `)

    const maxCounter = Number((counter[0] as unknown as { max_counter: number })?.max_counter || 0)
    const nextCounter = maxCounter > 0 ? maxCounter + 1 : baseCounter

    return `800.2.2/DRJT.ASN-${nextCounter}/413.204/${year}`
  }

  async createOrUpdate(userId: number, webinarId: number, nomorSertifikat: string): Promise<typeof sertifikatWebinarTable.$inferSelect> {
    const [existing] = await db.select()
      .from(sertifikatWebinarTable)
      .where(and(
        eq(sertifikatWebinarTable.user_id, userId),
        eq(sertifikatWebinarTable.webinar_id, webinarId)
      ))

    const [user] = await db.select({
      nip: usersTable.nip,
      nama: usersTable.nama,
      jabatan: usersTable.jabatan,
      unit_kerja: usersTable.unit_kerja,
    }).from(usersTable).where(eq(usersTable.id, userId))

    const [webinar] = await db.select({
      nama_webinar: webinarsTable.nama_webinar,
      tanggal_mulai: webinarsTable.tanggal_mulai,
      tanggal_selesai: webinarsTable.tanggal_selesai,
      jumlah_jp: webinarsTable.jumlah_jp,
      penyelenggara: webinarsTable.penyelenggara,
    }).from(webinarsTable).where(eq(webinarsTable.id, webinarId))

    if (!user || !webinar) {
      throw new Error('User atau webinar tidak ditemukan')
    }

    if (existing) {
      const [updated] = await db.update(sertifikatWebinarTable)
        .set({
          nomor_sertifikat: nomorSertifikat,
          nama: user.nama,
          jabatan: user.jabatan,
          unit_kerja: user.unit_kerja,
          updated_at: new Date(),
        })
        .where(eq(sertifikatWebinarTable.id, existing.id))
        .returning()
      return updated
    }

    const [created] = await db.insert(sertifikatWebinarTable)
      .values({
        user_id: userId,
        webinar_id: webinarId,
        nip: user.nip,
        nama: user.nama,
        jabatan: user.jabatan,
        unit_kerja: user.unit_kerja,
        nama_webinar: webinar.nama_webinar,
        tanggal_mulai: webinar.tanggal_mulai,
        tanggal_selesai: webinar.tanggal_selesai,
        jumlah_jp: webinar.jumlah_jp,
        penyelenggara: webinar.penyelenggara,
        nomor_sertifikat: nomorSertifikat,
      })
      .returning()
    
    return created
  }

  async getAll(filters?: { webinar_id?: number; year?: number }) {
    const conditions: (SQL | undefined)[] = []
    
    if (filters?.webinar_id) {
      conditions.push(eq(sertifikatWebinarTable.webinar_id, filters.webinar_id))
    }
    
    if (filters?.year) {
      conditions.push(sql`EXTRACT(YEAR FROM ${sertifikatWebinarTable.created_at}) = ${filters.year}`)
    }

    const validConditions = conditions.filter((c): c is SQL => c !== undefined)
    if (validConditions.length === 0) {
      return await db.select().from(sertifikatWebinarTable)
    }
    
    return await db.select().from(sertifikatWebinarTable).where(and(...validConditions))
  }

  async getByWebinar(webinarId: number) {
    return await db.select()
      .from(sertifikatWebinarTable)
      .where(eq(sertifikatWebinarTable.webinar_id, webinarId))
  }

  async getStats() {
    const total = await db.select({ count: sql<number>`COUNT(*)` })
      .from(sertifikatWebinarTable)
    
    const byYear = await db.select({
      year: sql<number>`EXTRACT(YEAR FROM created_at)`,
      count: sql<number>`COUNT(*)`,
    })
      .from(sertifikatWebinarTable)
      .groupBy(sql`EXTRACT(YEAR FROM created_at)`)
      .orderBy(sql`EXTRACT(YEAR FROM created_at) DESC`)

    return {
      total: total[0]?.count || 0,
      byYear,
    }
  }
}

export const sertifikatWebinarService = new SertifikatWebinarService()
