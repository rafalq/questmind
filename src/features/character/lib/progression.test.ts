// src/features/character/lib/progression.test.ts
import { describe, it, expect } from 'vitest'
import {
  effectiveAttributes,
  computeTier,
  resolveAbilities,
} from './progression'
import { getWorld } from '@/worlds'
import { ATTRIBUTE_HARD_MAX } from '@/features/character/constants'

// Bleeder: keyAttribute 'mind', growth { primary: 'mind', secondary: 'perception' }.
const bleeder = getWorld('treigthe').classes.find((c) => c.value === 'bleeder')!

describe('resolveAbilities', () => {
  it('gives the Bleeder both base abilities at tier 1', () => {
    const active = resolveAbilities(bleeder.abilities, 1)
    expect(active.map((a) => a.value)).toEqual(['bloodcast', 'toll_of_years'])
  })

  it('replaces base abilities with their evolved forms at tier 2', () => {
    const active = resolveAbilities(bleeder.abilities, 2)
    const values = active.map((a) => a.value)

    expect(values).toContain('crimson_echo')
    expect(values).toContain('the_long_price')
    // The whole point of evolvesFrom: superseded forms disappear.
    expect(values).not.toContain('bloodcast')
    expect(values).not.toContain('toll_of_years')
  })

  it('adds the capstone at tier 3 without regrowing superseded forms', () => {
    const active = resolveAbilities(bleeder.abilities, 3)
    expect(active).toHaveLength(3)
    expect(active.map((a) => a.value)).toContain('everything_costs_something')
  })
})

describe('computeTier', () => {
  it('starts at tier 1 below the first gate', () => {
    expect(computeTier(1, 14)).toBe(1)
  })

  it('gates on the key attribute alone — level is not a second condition', () => {
    // TIER_GATES keep minLevel at 1, so the key attribute is the only real gate.
    expect(computeTier(1, 16)).toBe(2) // key 16 is enough on its own, even at level 1
    expect(computeTier(13, 15)).toBe(1) // key below 16 stays T1, even at max level
  })

  it('reaches tier 3 only at key attribute 22', () => {
    expect(computeTier(1, 22)).toBe(3) // key 22 → T3 regardless of level
    expect(computeTier(13, 21)).toBe(2) // one short of the T3 gate
  })
})

describe('effectiveAttributes', () => {
  const base = {
    strength: 8,
    mind: 14,
    endurance: 10,
    agility: 10,
    charisma: 8,
    perception: 10,
  }

  it('grows primary and secondary by +1/level, leaves the rest alone', () => {
    const at3 = effectiveAttributes(base, bleeder, 3)
    expect(at3.mind).toBe(16) // primary (mind): 14 + 2 level-ups * 1
    expect(at3.perception).toBe(12) // secondary (perception): 10 + 2 level-ups * 1
    expect(at3.endurance).toBe(10) // untouched — endurance is nobody's growth attribute
    expect(at3.strength).toBe(8) // untouched — growth never subtracts
  })

  it('caps at ATTRIBUTE_HARD_MAX', () => {
    // primary mind at max level: 14 + 12 level-ups * 1 = 26, clamped to 24.
    const at13 = effectiveAttributes(base, bleeder, 13)
    expect(at13.mind).toBe(ATTRIBUTE_HARD_MAX) // 24
    expect(at13.perception).toBe(22) // secondary still below the cap
  })
})
