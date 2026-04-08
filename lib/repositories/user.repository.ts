import { db } from '@/lib/db'
import { usersTable, type userRoleEnum } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type CreateUserInput = {
  nip: string
  nama: string
  email: string
  password: string
}

export type User = typeof usersTable.$inferSelect

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    })
    return result || null
  }

  async findByNip(nip: string): Promise<User | null> {
    const result = await db.query.usersTable.findFirst({
      where: eq(usersTable.nip, nip),
    })
    return result || null
  }

  async findById(id: number): Promise<User | null> {
    const result = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    })
    return result || null
  }

  async create(input: CreateUserInput): Promise<User> {
    const result = await db.insert(usersTable).values(input).returning()
    return result[0]
  }

  async updateById(id: number, data: Partial<User>): Promise<User | null> {
    const result = await db
      .update(usersTable)
      .set({ ...data, updated_at: new Date() })
      .where(eq(usersTable.id, id))
      .returning()

    return result[0] || null
  }

  async findAll(): Promise<User[]> {
    return await db.query.usersTable.findMany({
      orderBy: (users, { asc }) => [asc(users.nama)],
    })
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await db.delete(usersTable).where(eq(usersTable.id, id)).returning()
    return result.length > 0
  }
}

export const userRepository = new UserRepository()
