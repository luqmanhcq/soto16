import bcrypt from 'bcryptjs'
import { userRepository, type User } from '@/lib/repositories/user.repository'
import { createToken } from '@/lib/jwt'
import type { RegisterDto, LoginResponseDto, UserMeDto } from '@/types/dto'

export class AuthService {
  async register(data: RegisterDto): Promise<User> {
    // Check if user already exists
    const existingByEmail = await userRepository.findByEmail(data.email)
    if (existingByEmail) {
      throw new Error('Email sudah terdaftar')
    }

    const existingByNip = await userRepository.findByNip(data.nip)
    if (existingByNip) {
      throw new Error('NIP sudah terdaftar')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    })

    return user
  }

  async login(nip: string, password: string): Promise<LoginResponseDto> {
    const normalizedNip = nip.trim()
    const normalizedPassword = password.trim()

    // Find user
    const user = await userRepository.findByNip(normalizedNip)
    if (!user) {
      throw new Error('NIP atau password salah')
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(normalizedPassword, user.password)
    if (!isPasswordValid) {
      throw new Error('NIP atau password salah')
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('User tidak aktif')
    }

    // Create JWT token
    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      token,
      user: {
        id: user.id,
        nip: user.nip,
        nama: user.nama,
        email: user.email,
        jabatan: user.jabatan,
        golongan: user.golongan,
        unit_kerja: user.unit_kerja,
        role: user.role,
      },
    }
  }

  async getUserById(id: number): Promise<UserMeDto | null> {
    const user = await userRepository.findById(id)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      nip: user.nip,
      nama: user.nama,
      email: user.email,
      jabatan: user.jabatan,
      golongan: user.golongan,
      unit_kerja: user.unit_kerja,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  }

  async updateProfile(
    id: number,
    data: Partial<{ nama: string; jabatan: string; unit_kerja: string }>
  ): Promise<UserMeDto | null> {
    const updated = await userRepository.updateById(id, data)
    if (!updated) {
      return null
    }

    return {
      id: updated.id,
      nip: updated.nip,
      nama: updated.nama,
      email: updated.email,
      jabatan: updated.jabatan,
      golongan: updated.golongan,
      unit_kerja: updated.unit_kerja,
      role: updated.role,
      is_active: updated.is_active,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    }
  }

  async getAllUsers(): Promise<UserMeDto[]> {
    const users = await userRepository.findAll()
    return users.map(user => ({
      id: user.id,
      nip: user.nip,
      nama: user.nama,
      email: user.email,
      jabatan: user.jabatan,
      golongan: user.golongan,
      unit_kerja: user.unit_kerja,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }))
  }

  async adminUpdateUser(id: number, data: any): Promise<UserMeDto | null> {
    let updateData = { ...data }
    
    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    }

    const updated = await userRepository.updateById(id, updateData)
    if (!updated) return null

    return {
      id: updated.id,
      nip: updated.nip,
      nama: updated.nama,
      email: updated.email,
      jabatan: updated.jabatan,
      golongan: updated.golongan,
      unit_kerja: updated.unit_kerja,
      role: updated.role,
      is_active: updated.is_active,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    }
  }
}

export const authService = new AuthService()
