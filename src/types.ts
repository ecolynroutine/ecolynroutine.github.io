export type Language = 'fr' | 'ar'
export type Localized = Record<Language, string>

export interface Article {
  slug: string
  category: string
  time: number
  title: Localized
  summary: Localized
  introduction: Localized
  explanation: Localized
  mistakes: Record<Language, string[]>
  gestures: Record<Language, string[]>
  watch: Localized
  professional: Localized
}

export interface SkinCase {
  id: string
  category: string
  statement: Localized
  possible: Localized
  guidance: Localized
}

export interface Testimonial {
  id: number
  image: string
  name: string
  category: Localized
  note: Localized
}
