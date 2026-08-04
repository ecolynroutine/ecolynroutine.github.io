export type Language = 'fr' | 'ar'
export type Localized = Record<Language, string>

export type EvidenceLevel = 'established' | 'encouraging' | 'limited' | 'myth'

export interface EditorialSource {
  label: string
  url: string
}

export interface Article {
  slug: string
  category: Localized
  time: number
  evidence: EvidenceLevel
  title: Localized
  summary: Localized
  introduction: Localized
  explanation: Localized
  observe: Localized
  mistakes: Record<Language, string[]>
  gestures: Record<Language, string[]>
  watch: Localized
  professional: Localized
  sources: EditorialSource[]
}

export interface SkinCase {
  id: string
  category: Localized
  statement: Localized
  possible: Localized
  guidance: Localized
}

export interface Testimonial {
  id: number
  image: string
  name: string
  audio: string
}

export interface NutritionChapter {
  id: string
  title: Localized
  fact: Localized
  mechanism: Localized
  foods: Localized
  known: Localized
  uncertain: Localized
  apply: Localized
  myth: Localized
  evidence: EvidenceLevel
  sources: EditorialSource[]
}
