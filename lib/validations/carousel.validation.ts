import { z } from 'zod'

export const carouselSchema = z.object({
  title: z.string().min(1, 'Judul harus diisi'),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, 'Gambar harus diunggah'),
  link: z.string().optional().nullable(),
  cta_text: z.string().optional().nullable().default('Lihat Detail'),
  is_active: z.boolean().default(true),
  order: z.number().default(0),
})

export type CarouselInput = z.infer<typeof carouselSchema>
export type CreateCarouselDto = CarouselInput
export type UpdateCarouselDto = Partial<CarouselInput>
