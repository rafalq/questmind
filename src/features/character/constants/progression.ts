// src/features/character/constants/progression.ts
//
// Character progression: XP → level → tier.
//
// The key attribute grows +1 per level (GROWTH_PRIMARY_PER_LEVEL), so from a
// creation cap of 12 it climbs one point a level to the hard cap of 24 at the
// level ceiling. Tier bands sit +6 apart on that climb — T1 from 10, T2 from
// 16, T3 from 22 — so the gates below are expressed on the key attribute alone.
// The level component is redundant now: at +1/level from a cap of 12, key 16 is
// unreachable before level 5 and key 22 before level 11 by construction, so a
// second level condition would never be the binding one. A generalist who never
// raises the key still grows it +1/level, but from a low base reaches 22 past
// the level ceiling — which is exactly how a specialist earns tier 3 and a
// generalist does not.

export const MAX_LEVEL = 13
export const MAX_TIER = 3

export type Tier = 1 | 2 | 3

/** XP required to *reach* each level. Index = level. */
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 700,
  4: 1200,
  5: 1900,
  6: 2700,
  7: 3600,
  8: 4600,
  9: 5700,
  10: 6900,
  11: 8200,
  12: 9600,
  13: 11100,
}

/** Awarded server-side, deterministically. The model never grants XP. */
export const XP_PER_TURN = 10
export const XP_PER_SESSION_COMPLETE = 50

/**
 * Attribute points gained per level-up, allocated automatically by class.
 * Both the primary (= key) and the secondary rise by 1. Endurance is nobody's
 * growth attribute, so HP does not climb with level.
 */
export const GROWTH_PRIMARY_PER_LEVEL = 1
export const GROWTH_SECONDARY_PER_LEVEL = 1

/**
 * Tier gates, keyed on the class's key attribute (+6 bands: T2 at 16, T3 at 22).
 * minLevel is kept at 1 so the gate is effectively key-only — see the header
 * note on why the level component is redundant under +1/level growth from a
 * creation cap of 12. Kept in the struct rather than removed so computeTier
 * does not have to change shape.
 */
export const TIER_GATES = [
  { tier: 2 as const, minLevel: 1, minKeyAttribute: 16 },
  { tier: 3 as const, minLevel: 1, minKeyAttribute: 22 },
]

/** Derive level from total XP. */
export function levelFromXp(xp: number): number {
  let level = 1
  for (let l = 2; l <= MAX_LEVEL; l++) {
    if (xp >= XP_THRESHOLDS[l]) level = l
    else break
  }
  return level
}

/** XP needed for the next level, or null at max level. */
export function xpToNextLevel(xp: number): number | null {
  const level = levelFromXp(xp)
  if (level >= MAX_LEVEL) return null
  return XP_THRESHOLDS[level + 1] - xp
}
