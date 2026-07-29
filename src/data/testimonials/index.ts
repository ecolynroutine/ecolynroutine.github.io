import type { Testimonial } from '../../types'

export const testimonials: Testimonial[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  image: `./assets/testimonials/testimonial-${index + 1}.webp`,
  name: ['S.', 'N.', 'M.', 'A.', 'I.', 'H.'][index],
  category: [
    { fr: 'Routine devenue plus simple', ar: 'روتين ولى أبسط' },
    { fr: 'Habitudes corrigées', ar: 'عادات تصححات' },
    { fr: 'Importance du SPF', ar: 'أهمية SPF' },
    { fr: 'Expérience avec la routine', ar: 'تجربة مع الروتين' },
    { fr: 'Écoute et accompagnement', ar: 'الاستماع والمواكبة' },
    { fr: 'Comprendre sa peau', ar: 'فهم البشرة' }
  ][index],
  note: {
    fr: 'Média existant fourni par ECOLYN. Le verbatim et l’autorisation de diffusion sont à renseigner avant publication.',
    ar: 'وسيط موجود من ECOLYN. خاص إضافة الكلام والموافقة على النشر قبل الإطلاق.'
  }
}))
