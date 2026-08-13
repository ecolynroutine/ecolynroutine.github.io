import { adviceItems, type AdviceItem, type AdviceKind, type ComplexionId } from './index'
import type { LifestyleId, SkinProfileId } from '../discovery'

export interface AdviceSelections {
  profile: SkinProfileId
  concern: string
  context: LifestyleId | ''
  complexion: ComplexionId
}

function matchesComplexion(item: AdviceItem, complexion: ComplexionId) {
  if (!item.tags.complexions.length) return true
  if (complexion === 'medium-dark') return item.tags.complexions.includes('medium-dark')
  return false
}

function score(item: AdviceItem, selection: AdviceSelections) {
  let value = item.priority
  if (item.tags.skinTypes.includes(selection.profile)) value += 9
  if (item.tags.concerns.includes(selection.concern)) value += 11
  if (selection.context && item.tags.contexts.includes(selection.context)) value += 12
  if (item.tags.complexions.includes(selection.complexion)) value += 5
  const matchCount = Number(item.tags.skinTypes.includes(selection.profile))
    + Number(item.tags.concerns.includes(selection.concern))
    + Number(Boolean(selection.context && item.tags.contexts.includes(selection.context)))
  value += matchCount * matchCount * 2
  return value
}

function candidates(kind: AdviceKind, selection: AdviceSelections) {
  return adviceItems
    .filter(item => item.kind === kind && matchesComplexion(item, selection.complexion))
    .filter(item => kind === 'skin'
      ? item.tags.skinTypes.includes(selection.profile)
      : kind === 'concern'
        ? item.tags.concerns.includes(selection.concern)
        : Boolean(selection.context && item.tags.contexts.includes(selection.context)))
    .sort((a, b) => score(b, selection) - score(a, selection) || a.id.localeCompare(b.id))
}

export function recommendAdvice(selection: AdviceSelections, limit = 6) {
  const picked: AdviceItem[] = []
  const add = (items: AdviceItem[], count: number) => {
    for (const item of items) {
      if (picked.length >= limit || count <= 0) break
      if (picked.some(current => current.id === item.id)) continue
      picked.push(item)
      count -= 1
    }
  }

  add(candidates('skin', selection), 2)
  add(candidates('concern', selection), 2)
  if (selection.context && selection.context !== 'none') add(candidates('context', selection), 2)

  const fallback = adviceItems
    .filter(item => matchesComplexion(item, selection.complexion))
    .filter(item => item.tags.skinTypes.includes(selection.profile) || item.tags.concerns.includes(selection.concern))
    .sort((a, b) => score(b, selection) - score(a, selection) || a.id.localeCompare(b.id))
  add(fallback, Math.max(0, Math.min(limit, 4) - picked.length))

  return picked.slice(0, limit)
}
