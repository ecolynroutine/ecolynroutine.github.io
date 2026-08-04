import type { Testimonial } from '../../types'
import { siteConfig } from '../site'

export const testimonials: Testimonial[] = siteConfig.assets.testimonials.map((item, index) => ({
  id: index + 1,
  image: item.image,
  name: item.name,
  audio: item.audio,
}))
