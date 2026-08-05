import { z } from 'zod'

export const createPembelajaranSchema = z.object({
    nama: z.string().min(3, 'Nama minimal 3 karakter').max(255),
    slug: z.string().min(3, 'Slug minimal 3 karakter').max(255),
    kategori: z.string().optional().nullable(),
    deskripsi: z.string().optional().nullable(),
    jumlah_jp: z.number().int().nonnegative().min(1, 'JP minimal 1').optional().nullable(),
    gambar: z.string().optional().nullable(),
})

export const updatePembelajaranSchema = createPembelajaranSchema.partial()

export const createMateriSchema = z.object({
    pembelajaran_id: z.number().int().positive(),
    nama: z.string().min(3, 'Nama materi minimal 3 karakter').max(255),
    urutan: z.number().int().nonnegative(),
    tipe: z.enum(['pdf', 'video', 'playlist']).default('video').optional(),
    link_file: z.string().optional().nullable().or(z.literal('')),
    link_video: z.string().optional().nullable().or(z.literal('')),
})

export const updateMateriSchema = createMateriSchema.partial()

export const progressSchema = z.object({
    pembelajaran_id: z.number().int().positive(),
    materi_id: z.number().int().positive().optional().nullable(),
    current_materi_id: z.number().int().positive().optional().nullable(),
    progress: z.number().int().min(0).max(100).optional(),
    status: z.enum(['belum_mulai', 'proses', 'selesai']).default('belum_mulai'),
})

// Question schemas
export const createPembelajaranQuestionSchema = z.object({
    pembelajaran_id: z.number().int().positive(),
    type: z.enum(['pre_test', 'post_test', 'monev']),
    question_text: z.string().min(3, 'Pertanyaan minimal 3 karakter'),
    order: z.number().int().nonnegative().default(0),
    options: z.array(z.object({
        option_text: z.string().min(1, 'Opsi tidak boleh kosong'),
        is_correct: z.boolean().default(false),
        order: z.number().int().nonnegative().default(0),
    })).min(2, 'Minimal 2 opsi jawaban'),
})

export const updatePembelajaranQuestionSchema = z.object({
    question_text: z.string().min(3).optional(),
    order: z.number().int().nonnegative().optional(),
    options: z.array(z.object({
        id: z.number().int().optional(),
        option_text: z.string().min(1),
        is_correct: z.boolean().default(false),
        order: z.number().int().nonnegative().default(0),
    })).min(2).optional(),
})

export const createPembelajaranAnswerSchema = z.object({
    question_id: z.number().int().positive(),
    option_id: z.number().int().positive(),
    type: z.enum(['pre_test', 'post_test', 'monev']),
})

export type CreatePembelajaranDto = z.infer<typeof createPembelajaranSchema>
export type UpdatePembelajaranDto = z.infer<typeof updatePembelajaranSchema>
export type CreateMateriDto = z.infer<typeof createMateriSchema>
export type UpdateMateriDto = z.infer<typeof updateMateriSchema>
export type ProgressDto = z.infer<typeof progressSchema>
export type CreatePembelajaranQuestionDto = z.infer<typeof createPembelajaranQuestionSchema>
export type UpdatePembelajaranQuestionDto = z.infer<typeof updatePembelajaranQuestionSchema>
export type CreatePembelajaranAnswerDto = z.infer<typeof createPembelajaranAnswerSchema>
