export const videoSlots = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  source: '',
  poster: `./assets/testimonials/testimonial-${(index % 6) + 1}.webp`,
  duration: '00:00',
  category: [
    'expérience avec les conseils', 'expérience avec la routine', 'importance du SPF',
    'habitudes corrigées', 'routine devenue plus simple'
  ][index % 5],
  published: false
}))
