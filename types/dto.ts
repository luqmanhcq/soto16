// ============ AUTH DTO ============

export type RegisterDto = {
  nip: string
  nama: string
  email: string
  password: string
}

export type LoginDto = {
  nip: string
  password: string
}

export type LoginResponseDto = {
  token: string
  user: {
    id: number
    nip: string
    nama: string
    email: string
    jabatan: string | null
    golongan: string | null
    unit_kerja: string | null
    role: string
  }
}

export type UserMeDto = {
  id: number
  nip: string
  nama: string
  email: string
  jabatan: string | null
  golongan: string | null
  unit_kerja: string | null
  role: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// ============ API RESPONSE ============

export type ApiResponse<T> = {
  success: boolean
  message: string
  data?: T
  errors?: {
    field?: string
    message: string
  }[]
}
