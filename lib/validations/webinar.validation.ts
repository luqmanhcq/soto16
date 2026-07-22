import { z } from 'zod';

export const createWebinarSchema = z.object({
    nama_webinar: z.string().min(3, 'Nama webinar minimal 3 karakter').max(255),
    slug: z.string().min(3, 'Slug minimal 3 karakter').max(255),
    kategori: z.string().optional().nullable(),
    deskripsi: z.string().optional().nullable(),
    narasumber: z.string().optional().nullable(),
    jumlah_jp: z.number().int().nonnegative().min(1, 'JP minimal 1').optional().nullable(),
    nilai_min: z.number().int().nonnegative().optional().nullable(),
    tanggal_mulai: z.string().min(1, 'Tanggal mulai wajib diisi').optional().nullable(),
    tanggal_selesai: z.string().min(1, 'Tanggal selesai wajib diisi').optional().nullable(),
    kuota: z.number().int().nonnegative().optional().nullable(),
    penyelenggara: z.string().optional().nullable(),
    link_zoom: z.string().url('Link zoom harus berupa URL valid').optional().nullable().or(z.literal('')),
    link_youtube: z.string().url('Link youtube harus berupa URL valid').optional().nullable().or(z.literal('')),
    link_materi: z.string().url('Link materi harus berupa URL valid').optional().nullable().or(z.literal('')),
    link_post_test: z.string().url('Link post test harus berupa URL valid').optional().nullable().or(z.literal('')),
    link_monev: z.string().url('Link monev harus berupa URL valid').optional().nullable().or(z.literal('')),
    template_sertifikat: z.string().optional().nullable().or(z.literal('')),
    sertifikat_config: z.string().optional().nullable().or(z.literal('')),
    gambar: z.string().optional().nullable(),
    status: z.enum(['draft', 'publish', 'selesai']).default('draft'),
});

export const updateWebinarSchema = createWebinarSchema.partial();

export type CreateWebinarDto = z.infer<typeof createWebinarSchema>;
export type UpdateWebinarDto = z.infer<typeof updateWebinarSchema>;
