import { z } from 'zod'

export const submitSertifikatSchema = z.object({
    nama_diklat: z.string().min(3, 'Nama diklat minimal 3 karakter').max(255),
    tanggal_pelaksanaan: z.string().optional().nullable(), // YYYY-MM-DD
    jumlah_jp: z.number().int().nonnegative().optional().nullable(),
    penyelenggara: z.string().min(3, 'Penyelenggara minimal 3 karakter').max(255),
    file_usulan: z.string().min(1, 'File usulan (bukti) wajib diunggah'),
})

export const approveSertifikatSchema = z.object({
    file_sertifikat: z.string().optional().nullable(), // Admin can provide custom certificate file if any
})

export const rejectSertifikatSchema = z.object({
    reason: z.string().min(5, 'Alasan penolakan minimal 5 karakter'),
})

export type SubmitSertifikatDto = z.infer<typeof submitSertifikatSchema>
export type ApproveSertifikatDto = z.infer<typeof approveSertifikatSchema>
export type RejectSertifikatDto = z.infer<typeof rejectSertifikatSchema>
