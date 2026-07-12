// src/features/character/lib/progression.test.ts
import { describe, it, expect } from 'vitest'
import {
  effectiveAttributes,
  computeTier,
  resolveAbilities,
} from './progression'
import { getWorld } from '@/worlds'

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
  it('starts at tier 1', () => {
    expect(computeTier(1, 14)).toBe(1)
  })

  it('requires BOTH level and key attribute', () => {
    expect(computeTier(3, 12)).toBe(2) // both met
    expect(computeTier(2, 20)).toBe(1) // attribute fine, level too low
    expect(computeTier(3, 11)).toBe(1) // level fine, attribute too low
  })

  it('gates tier 3 behind level 6', () => {
    expect(computeTier(5, 20)).toBe(2)
    expect(computeTier(6, 16)).toBe(3)
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

  it('grows primary and secondary, leaves the rest alone', () => {
    const at3 = effectiveAttributes(base, bleeder, 3)
    expect(at3.mind).toBe(18) // 14 + 2 levels * 2
    expect(at3.endurance).toBe(12) // 10 + 2 levels * 1
    expect(at3.strength).toBe(8) // untouched — growth never subtracts
  })

  it('caps at ATTRIBUTE_HARD_MAX', () => {
    const at6 = effectiveAttributes(base, bleeder, 6)
    expect(at6.mind).toBe(20) // 14 + 10 = 24, capped
  })
})
