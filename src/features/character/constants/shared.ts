// features/character/constants/shared.ts

// ============================================================
// SHARED TYPES
// ============================================================

export type Attribute =
  | 'strength'
  | 'mind'
  | 'endurance'
  | 'agility'
  | 'charisma'
  | 'perception'

// Genre identifiers — extend as new genres are added
export type { Genre } from '@/worlds/schema/primitives'

export type RaceDefinition<TRace extends string = string> = {
  value: TRace
  label: string
  description: string
  modifiers: Partial<Record<Attribute, number>>
  genderless?: boolean
  portraitUrl?: string // used when genderless
  malePortraitUrl?: string
  femalePortraitUrl?: string
}

export type ClassDefinition<TClass extends string = string> = {
  value: TClass
  label: string
  description: string
  modifiers: Partial<Record<Attribute, number>>
}

// ============================================================
// POINT BUY SYSTEM
// ============================================================
//
// Creation model: every attribute starts at the floor (5) and the player
// distributes a fixed pool (8) on top, never subtracting. So the total spent
// is always floor*6 + pool = 30 + 8 = 38, and no single attribute can be
// raised past ATTRIBUTE_MAX (10) at distribution time. Race, class and gender
// modifiers are then applied on top, and the *final* creation value is clamped
// to ATTRIBUTE_CREATION_MAX (12) — see calculateAttributeTotal.
//
// Two ceilings, deliberately separate:
//   ATTRIBUTE_CREATION_MAX (12) — the most any attribute can be at creation.
//   ATTRIBUTE_HARD_MAX     (24) — the most it can ever reach, via level growth.
// The last 12 points from 12 → 24 are earned only by playing, never bought.
// This is the whole point of the rebalance: a specialist can no longer sit at
// the growth ceiling on turn one.

export const POINT_BUY_TOTAL = 38 // floor*6 + pool = 30 + 8
export const ATTRIBUTE_MIN = 5 // floor: every attribute starts here
export const ATTRIBUTE_MAX = 10 // point-buy per-attribute cap, before modifiers
export const ATTRIBUTE_CREATION_MAX = 12 // final cap at creation, after modifiers
export const ATTRIBUTE_HARD_MAX = 24 // absolute cap, reached only through growth

// ============================================================
// HP CALCULATION
// Consistent with src/features/character/lib/hp.ts
// BASE_HP + (endurance * HP_PER_ENDURANCE)
//
// Endurance is nobody's growth attribute under the current class table, so HP
// is set at creation and stays flat for the character's whole life. With
// endurance in the creation range (5–12) that puts maxHp at 100–170, which is
// what finally makes the flat ability HP costs (5 / 8) read as a real price.
// ============================================================

export const BASE_HP = 50
export const HP_PER_ENDURANCE = 10

export const calculateMaxHp = (enduranceTotal: number): number => {
  return BASE_HP + enduranceTotal * HP_PER_ENDURANCE
}

// ============================================================
// HELPER: calculate total attribute value (CREATION ONLY)
// ============================================================
//
// Point-buy base + race/gender modifiers + class modifier, clamped to the
// CREATION ceiling — not the hard ceiling. Growth is applied separately by
// effectiveAttributes (lib/progression.ts), which is the only place that may
// clamp up to ATTRIBUTE_HARD_MAX.

export const calculateAttributeTotal = (
  base: number,
  raceModifier: number = 0,
  classModifier: number = 0
): number => {
  return Math.min(
    ATTRIBUTE_CREATION_MAX,
    Math.max(1, base + raceModifier + classModifier)
  )
}

// ============================================================
// XP THRESHOLDS
// ============================================================
// NOTE (cleanup, see progression grep): these two legacy constants predate the
// XP_THRESHOLDS / XP_PER_TURN model in constants/progression.ts and may be
// dead. Left untouched here — to be reconciled in the grep-sanity commit rather
// than silently removed.

export const ATTRIBUTE_XP_THRESHOLD = 100
export const CHARACTER_XP_PER_SESSION = 50