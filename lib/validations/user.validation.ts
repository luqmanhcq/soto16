import { z } from 'zod'

export const updateProfileSchema = z.object({
    nama: z.string().min(3, 'Nama minimal 3 karakter').max(255).optional(),
    email: z.string().email('Email tidak valid').optional(),
    jabatan: z.string().max(100).optional().nullable(),
    golongan: z.string().max(50).optional().nullable(),
    unit_kerja: z.string().max(255).optional().nullable(),
})

export const updatePasswordSchema = z
    .object({
        currentPassword: z.string().min(6, 'Password saat ini minimal 6 karakter'),
        newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
        confirmNewPassword: z.string().min(6, 'Konfirmasi password baru minimal 6 karakter'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'Konfirmasi password tidak cocok',
        path: ['confirmNewPassword'],
    })

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>
