// src/features/character/constants/progression.ts
//
// Character progression: XP → level → tier.
// Tier gating is a conjunction of level AND the class's key attribute, so a
// specialist reaches tier 3 while a generalist never does — and nobody can
// unlock it at creation by dumping point-buy into one stat.

export const MAX_LEVEL = 6
export const MAX_TIER = 3

export type Tier = 1 | 2 | 3

/** XP required to *reach* each level. Index = level. */
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 700,
  4: 1200,
  5: 1800,
  6: 2500,
}

/** Awarded server-side, deterministically. The model never grants XP. */
export const XP_PER_TURN = 10
export const XP_PER_SESSION_COMPLETE = 50

/** Attribute points gained per level-up, allocated automatically by class. */
export const GROWTH_PRIMARY_PER_LEVEL = 2
export const GROWTH_SECONDARY_PER_LEVEL = 1

/**
 * Tier gates. Both conditions must hold.
 * Tier 1 is the baseline and needs no gate.
 */
export const TIER_GATES = [
  { tier: 2 as const, minLevel: 3, minKeyAttribute: 12 },
  { tier: 3 as const, minLevel: 6, minKeyAttribute: 16 },
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
