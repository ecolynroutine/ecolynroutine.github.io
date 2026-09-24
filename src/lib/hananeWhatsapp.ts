import type { Language } from '../types'

export function hananeWhatsappUrl(lang: Language) {
  const number = (window.ECOLYN_CONFIG?.whatsappNumber || '212699072913').replace(/\D/g, '')
  const message = lang === 'fr'
    ? 'Bonjour Hanane, je souhaite vous poser une question concernant les conseils ECOLYN.'
    : 'سلام حنان، بغيت نسولك على نصائح إيكولين.'

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
