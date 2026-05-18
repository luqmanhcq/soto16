import { carouselRepository } from '@/lib/repositories/carousel.repository'
import { CreateCarouselDto, UpdateCarouselDto } from '@/lib/validations/carousel.validation'

export class CarouselService {
    async getAll(onlyActive: boolean = false) {
        return await carouselRepository.getAll(onlyActive)
    }

    async getById(id: number) {
        const carousel = await carouselRepository.findById(id)
        if (!carousel) {
            throw new Error('Carousel tidak ditemukan')
        }
        return carousel
    }

    async create(data: CreateCarouselDto) {
        return await carouselRepository.create(data)
    }

    async update(id: number, data: UpdateCarouselDto) {
        const updated = await carouselRepository.update(id, data)
        if (!updated) {
            throw new Error('Carousel tidak ditemukan untuk diupdate')
        }
        return updated
    }

    async delete(id: number) {
        const deleted = await carouselRepository.delete(id)
        if (!deleted) {
            throw new Error('Carousel tidak ditemukan untuk dihapus')
        }
        return deleted
    }
}

export const carouselService = new CarouselService()
