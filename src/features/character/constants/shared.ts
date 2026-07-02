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
export type Genre = 'fantasy' | 'sci-fi' | 'cyberpunk'

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

export const POINT_BUY_TOTAL = 60
export const ATTRIBUTE_MIN = 1
export const ATTRIBUTE_MAX = 15 // before racial/class modifiers
export const ATTRIBUTE_HARD_MAX = 20 // after all modifiers

// ============================================================
// HP CALCULATION
// Consistent with src/features/character/lib/hp.ts
// BASE_HP + (endurance * HP_PER_ENDURANCE)
// ============================================================

export const BASE_HP = 50
export const HP_PER_ENDURANCE = 10

export const calculateMaxHp = (enduranceTotal: number): number => {
  return BASE_HP + enduranceTotal * HP_PER_ENDURANCE
}

// ============================================================
// HELPER: calculate total attribute value
// ============================================================

export const calculateAttributeTotal = (
  base: number,
  raceModifier: number = 0,
  classModifier: number = 0
): number => {
  return Math.min(
    ATTRIBUTE_HARD_MAX,
    Math.max(1, base + raceModifier + classModifier)
  )
}

// ============================================================
// XP THRESHOLDS
// ============================================================

export const ATTRIBUTE_XP_THRESHOLD = 100
export const CHARACTER_XP_PER_SESSION = 50
