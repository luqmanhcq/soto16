import { db } from '@/lib/db'
import { carouselsTable } from '@/lib/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { CreateCarouselDto, UpdateCarouselDto } from '@/lib/validations/carousel.validation'

export type Carousel = typeof carouselsTable.$inferSelect

export class CarouselRepository {
    async getAll(onlyActive: boolean = false) {
        return await db.query.carouselsTable.findMany({
            where: onlyActive ? eq(carouselsTable.is_active, true) : undefined,
            orderBy: [asc(carouselsTable.order), desc(carouselsTable.created_at)],
        })
    }

    async findById(id: number): Promise<Carousel | null> {
        const result = await db.query.carouselsTable.findFirst({
            where: eq(carouselsTable.id, id),
        })
        return result || null
    }

    async create(data: CreateCarouselDto): Promise<Carousel> {
        const result = await db
            .insert(carouselsTable)
            .values(data as any)
            .returning()

        return result[0]
    }

    async update(id: number, data: UpdateCarouselDto): Promise<Carousel | null> {
        const result = await db
            .update(carouselsTable)
            .set({
                ...data,
                updated_at: new Date(),
            } as any)
            .where(eq(carouselsTable.id, id))
            .returning()

        return result[0] || null
    }

    async delete(id: number): Promise<Carousel | null> {
        const result = await db
            .delete(carouselsTable)
            .where(eq(carouselsTable.id, id))
            .returning()

        return result[0] || null
    }
}

export const carouselRepository = new CarouselRepository()
