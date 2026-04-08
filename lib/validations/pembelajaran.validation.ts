import { z } from 'zod'

export const createPembelajaranSchema = z.object({
    nama: z.string().min(3, 'Nama minimal 3 karakter').max(255),
    slug: z.string().min(3, 'Slug minimal 3 karakter').max(255),
    kategori: z.string().optional().nullable(),
    deskripsi: z.string().optional().nullable(),
    jumlah_jp: z.number().int().nonnegative().optional().nullable(),
    gambar: z.string().optional().nullable(),
    link_pretest: z.string().url('Link pretest harus berupa URL valid').optional().nullable().or(z.literal('')),
    link_posttest: z.string().url('Link posttest harus berupa URL valid').optional().nullable().or(z.literal('')),
})

export const updatePembelajaranSchema = createPembelajaranSchema.partial()

export const createMateriSchema = z.object({
    pembelajaran_id: z.number().int().positive(),
    nama: z.string().min(3, 'Nama materi minimal 3 karakter').max(255),
    urutan: z.number().int().nonnegative(),
    link_file: z.string().url('Link file harus berupa URL valid').optional().nullable().or(z.literal('')),
    link_video: z.string().url('Link video harus berupa URL valid').optional().nullable().or(z.literal('')),
})

export const updateMateriSchema = createMateriSchema.partial()

export const progressSchema = z.object({
    pembelajaran_id: z.number().int().positive(),
    progress: z.number().int().min(0).max(100),
    status: z.enum(['belum_mulai', 'proses', 'selesai']).default('belum_mulai'),
})

export type CreatePembelajaranDto = z.infer<typeof createPembelajaranSchema>
export type UpdatePembelajaranDto = z.infer<typeof updatePembelajaranSchema>
export type CreateMateriDto = z.infer<typeof createMateriSchema>
export type UpdateMateriDto = z.infer<typeof updateMateriSchema>
export type ProgressDto = z.infer<typeof progressSchema>
