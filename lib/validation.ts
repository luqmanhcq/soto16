import { z } from 'zod'

// ============ AUTH VALIDATION ============

export const registerSchema = z.object({
  nip: z.string().min(18).max(18).regex(/^\d+$/, 'NIP harus angka'),
  nama: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(100),
})

export const loginSchema = z.object({
  nip: z.string()
    .trim()
    .min(18, 'NIP harus terdiri dari 18 angka')
    .max(18, 'NIP harus terdiri dari 18 angka')
    .regex(/^\d+$/, 'NIP harus angka'),
  password: z.string().trim().min(6, 'Password minimal 6 karakter'),
})

export const updateProfileSchema = z.object({
  nama: z.string().min(3).max(255).optional(),
  jabatan: z.string().max(100).optional(),
  unit_kerja: z.string().max(255).optional(),
})

// ============ TYPE INFERENCE ============

export type RegisterRequest = z.infer<typeof registerSchema>
export type LoginRequest = z.infer<typeof loginSchema>
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>
