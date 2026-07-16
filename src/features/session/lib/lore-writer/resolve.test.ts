import { describe, it, expect } from 'vitest'
import { normalizeNpcName, resolveNpcIds, mergeUnique } from './resolve'

// Mirrors the Tréigthe seed — Canncaillte is role='hidden' and never reaches
// the prompt, so the model cannot name him; he is not in this fixture.
const AUTHORED = [
  { id: 'id-ciaran', name: 'Ciarán Mór' },
  { id: 'id-mathair', name: 'Máthair Liath' },
]

describe('normalizeNpcName', () => {
  it('strips Irish fadas', () => {
    expect(normalizeNpcName('Ciarán Mór')).toBe('ciaran mor')
  })

  it('strips Polish ł, which NFD does not decompose', () => {
    expect(normalizeNpcName('Michał')).toBe('michal')
  })

  it('collapses whitespace and trims', () => {
    expect(normalizeNpcName('  Máthair   Liath ')).toBe('mathair liath')
  })
})

describe('resolveNpcIds', () => {
  it('matches an exact authored name', () => {
    expect(resolveNpcIds(['Ciarán Mór'], AUTHORED).ids).toEqual(['id-ciaran'])
  })

  it('matches when the model drops the diacritics', () => {
    expect(resolveNpcIds(['Ciaran Mor'], AUTHORED).ids).toEqual(['id-ciaran'])
  })

  it('reports improvised NPCs as unknown rather than dropping them silently', () => {
    const { ids, unknown } = resolveNpcIds(['A beggar', 'Ciarán Mór'], AUTHORED)
    expect(ids).toEqual(['id-ciaran'])
    expect(unknown).toEqual(['A beggar'])
  })

  it('does not partial-match a first name', () => {
    // "Ciarán" alone must NOT resolve. A wrong link is worse than no link.
    const { ids, unknown } = resolveNpcIds(['Ciarán'], AUTHORED)
    expect(ids).toEqual([])
    expect(unknown).toEqual(['Ciarán'])
  })

  it('does not match a title instead of a name', () => {
    expect(resolveNpcIds(['High Archbishop'], AUTHORED).ids).toEqual([])
  })

  it('deduplicates within a single turn', () => {
    expect(resolveNpcIds(['Ciarán Mór', 'Ciaran Mor'], AUTHORED).ids).toEqual([
      'id-ciaran',
    ])
  })

  it('returns empty for an empty turn', () => {
    expect(resolveNpcIds([], AUTHORED)).toEqual({ ids: [], unknown: [] })
  })
})

describe('mergeUnique', () => {
  it('returns null when nothing new was added', () => {
    expect(mergeUnique(['a', 'b'], ['a'])).toBeNull()
  })

  it('returns null for an empty incoming array', () => {
    expect(mergeUnique(['a'], [])).toBeNull()
  })

  it('returns the merged set when something new arrives', () => {
    expect(mergeUnique(['a'], ['b'])).toEqual(['a', 'b'])
  })

  it('merges into an empty existing set', () => {
    expect(mergeUnique([], ['a'])).toEqual(['a'])
  })
})
