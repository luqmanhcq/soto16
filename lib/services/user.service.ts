import bcrypt from 'bcryptjs'
import { userRepository, type User } from '@/lib/repositories/user.repository'
import { UpdateProfileDto, UpdatePasswordDto } from '@/lib/validations/user.validation'

export class UserService {
    async getProfile(userId: number) {
        const user = await userRepository.findById(userId)
        if (!user) {
            throw new Error('User tidak ditemukan')
        }

        // Return without password
        const { password: _, ...profile } = user
        return profile
    }

    async getAllUsers() {
        const users = await userRepository.findAll()
        // Return without password
        return users.map(({ password: _, ...user }) => user)
    }

    async adminUpdateUser(userId: number, data: Partial<User>) {
        const updated = await userRepository.updateById(userId, data)
        if (!updated) {
            throw new Error('Gagal mengupdate user')
        }

        const { password: _, ...profile } = updated
        return profile
    }

    async deleteUser(userId: number) {
        // You might want to check if the user exists first
        return await userRepository.deleteById(userId)
    }


    async updateProfile(userId: number, dto: UpdateProfileDto) {
        // Check email uniqueness if it's being updated
        if (dto.email) {
            const existing = await userRepository.findByEmail(dto.email)
            if (existing && existing.id !== userId) {
                throw new Error('Email sudah digunakan oleh user lain')
            }
        }

        const updated = await userRepository.updateById(userId, dto as any)
        if (!updated) {
            throw new Error('Gagal mengupdate profil')
        }

        const { password: _, ...profile } = updated
        return profile
    }

    async updatePassword(userId: number, dto: UpdatePasswordDto) {
        const user = await userRepository.findById(userId)
        if (!user) {
            throw new Error('User tidak ditemukan')
        }

        // Verify current password
        const isMatched = await bcrypt.compare(dto.currentPassword, user.password)
        if (!isMatched) {
            throw new Error('Password saat ini tidak cocok')
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10)

        const updated = await userRepository.updateById(userId, {
            password: hashedNewPassword,
        })

        if (!updated) {
            throw new Error('Gagal mengupdate password')
        }

        return { success: true }
    }
}

export const userService = new UserService()
