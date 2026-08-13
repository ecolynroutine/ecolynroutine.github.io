import { adviceItems, type AdviceItem, type ComplexionId } from './index'
import type { LifestyleId, SkinProfileId } from '../discovery'

export interface AdviceSelections {
  profiles: SkinProfileId[]
  concerns: string[]
  contexts: LifestyleId[]
  complexion: ComplexionId
}

export interface AdviceMatches {
  profiles: SkinProfileId[]
  concerns: string[]
  contexts: LifestyleId[]
  complexion: boolean
}

export interface AdviceRecommendation {
  item: AdviceItem
  score: number
  matches: AdviceMatches
}

function intersection<T>(left: T[], right: T[]) {
  return left.filter(value => right.includes(value))
}

function matchesComplexion(item: AdviceItem, complexion: ComplexionId) {
  if (!item.tags.complexions.length) return true
  return complexion === 'medium-dark' && item.tags.complexions.includes('medium-dark')
}

function assess(item: AdviceItem, selection: AdviceSelections): AdviceRecommendation {
  const matchedProfiles = intersection(selection.profiles, item.tags.skinTypes)
  const matchedConcerns = intersection(selection.concerns, item.tags.concerns)
  const matches: AdviceMatches = {
    profiles: item.tags.skinTypes.length >= 5 ? [] : matchedProfiles,
    concerns: item.tags.concerns.length >= 8 ? [] : matchedConcerns,
    contexts: intersection(selection.contexts.filter(value => value !== 'none'), item.tags.contexts),
    complexion: selection.complexion !== 'unspecified' && item.tags.complexions.includes(selection.complexion),
  }
  const dimensions = Number(matches.profiles.length > 0)
    + Number(matches.concerns.length > 0)
    + Number(matches.contexts.length > 0)
    + Number(matches.complexion)
  const profileSpecificity = matches.profiles.length ? matches.profiles.length / Math.max(1, item.tags.skinTypes.length) : 0
  const concernSpecificity = matches.concerns.length ? matches.concerns.length / Math.max(1, item.tags.concerns.length) : 0
  const contextSpecificity = matches.contexts.length ? matches.contexts.length / Math.max(1, item.tags.contexts.length) : 0
  const preciseConcernCross = matches.concerns.length >= 2 && item.tags.concerns.length <= 4
  const score = item.priority * 3
    + Number(matches.profiles.length > 0) * 7 + profileSpecificity * 7
    + Number(matches.concerns.length > 0) * 10 + concernSpecificity * 14
    + Number(matches.contexts.length > 0) * 9 + contextSpecificity * 10
    + Number(matches.complexion) * 6
    + dimensions * dimensions * 6
    + Number(preciseConcernCross) * 12
  return { item, score, matches }
}

function relevant(result: AdviceRecommendation) {
  const { matches } = result
  return Boolean(matches.profiles.length || matches.concerns.length || matches.contexts.length || matches.complexion)
}

export function recommendAdvice(selection: AdviceSelections, limit = 8) {
  const safeLimit = Math.max(5, Math.min(8, limit))
  const ranked = adviceItems
    .filter(item => matchesComplexion(item, selection.complexion))
    .filter(item => !(selection.contexts.includes('pregnancy') && item.id === 'retinoid-start-slow'))
    .map(item => assess(item, selection))
    .filter(relevant)
    .sort((a, b) => b.score - a.score || b.item.priority - a.item.priority || a.item.id.localeCompare(b.item.id))

  const picked: AdviceRecommendation[] = []
  const add = (candidate: AdviceRecommendation | undefined) => {
    if (!candidate || picked.length >= safeLimit || picked.some(result => result.item.id === candidate.item.id)) return
    picked.push(candidate)
  }

  // Les croisements entre au moins deux dimensions passent avant les conseils génériques.
  ranked
    .filter(({ matches }) => Number(matches.profiles.length > 0) + Number(matches.concerns.length > 0) + Number(matches.contexts.length > 0) >= 2)
    .slice(0, 3)
    .forEach(add)

  // Chaque préoccupation choisie peut apporter au moins un conseil, sans dépasser la lecture courte.
  for (const concern of selection.concerns) add(ranked.find(result => result.matches.concerns.includes(concern)))
  for (const context of selection.contexts.filter(value => value !== 'none')) add(ranked.find(result => result.matches.contexts.includes(context)))
  for (const profile of selection.profiles) add(ranked.find(result => result.matches.profiles.includes(profile)))
  ranked.forEach(add)

  return picked.slice(0, safeLimit)
}
