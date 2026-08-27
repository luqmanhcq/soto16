import { z } from 'zod'

export const createManajemenPengetahuanSchema = z.object({
    nama: z.string().min(3, 'Nama minimal 3 karakter').max(255),
    slug: z.string().min(3, 'Slug minimal 3 karakter').max(255),
    kategori: z.string().optional().nullable(),
    deskripsi: z.string().optional().nullable(),
    jumlah_jp: z.number().int().nonnegative().min(1, 'JP minimal 1').optional().nullable(),
    gambar: z.string().optional().nullable(),
})

export const updateManajemenPengetahuanSchema = createManajemenPengetahuanSchema.partial()

export const createMpMateriSchema = z.object({
    manajemen_pengetahuan_id: z.number().int().positive(),
    nama: z.string().min(3, 'Nama materi minimal 3 karakter').max(255),
    urutan: z.number().int().nonnegative(),
    tipe: z.enum(['pdf', 'video', 'playlist']).default('video').optional(),
    link_file: z.string().optional().nullable().or(z.literal('')),
    link_video: z.string().optional().nullable().or(z.literal('')),
})

export const updateMpMateriSchema = createMpMateriSchema.partial()

export const mpProgressSchema = z.object({
    manajemen_pengetahuan_id: z.number().int().positive(),
    materi_id: z.number().int().positive().optional().nullable(),
    current_materi_id: z.number().int().positive().optional().nullable(),
    progress: z.number().int().min(0).max(100).optional(),
    status: z.enum(['belum_mulai', 'proses', 'selesai']).default('belum_mulai'),
})

export type CreateManajemenPengetahuanDto = z.infer<typeof createManajemenPengetahuanSchema>
export type UpdateManajemenPengetahuanDto = z.infer<typeof updateManajemenPengetahuanSchema>
export type CreateMpMateriDto = z.infer<typeof createMpMateriSchema>
export type UpdateMpMateriDto = z.infer<typeof updateMpMateriSchema>
export type MpProgressDto = z.infer<typeof mpProgressSchema>