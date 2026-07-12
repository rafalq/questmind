// src/features/character/lib/progression.ts
import type { AbilityDefinition, ClassDefinition } from '@/worlds/schema'
import type { Attribute } from '@/worlds/schema'
import {
  TIER_GATES,
  MAX_LEVEL,
  type Tier,
} from '@/features/character/constants/progression'
import {
  GROWTH_PRIMARY_PER_LEVEL,
  GROWTH_SECONDARY_PER_LEVEL,
} from '@/features/character/constants/progression'
import { ATTRIBUTE_HARD_MAX } from '@/features/character/constants'

type AttributeMap = Record<Attribute, number>

/**
 * Attributes as the game actually sees them: point-buy base, plus race/class/
 * gender modifiers, plus growth auto-allocated on every level-up.
 * Growth never subtracts — a class with a strength penalty does not get weaker
 * as it levels.
 */
export function effectiveAttributes(
  base: AttributeMap,
  classDef: ClassDefinition,
  level: number
): AttributeMap {
  const levelsGained = Math.max(0, level - 1)
  const result = { ...base }

  const { primary, secondary } = classDef.growth
  result[primary] += levelsGained * GROWTH_PRIMARY_PER_LEVEL
  result[secondary] += levelsGained * GROWTH_SECONDARY_PER_LEVEL

  for (const key of Object.keys(result) as Attribute[]) {
    result[key] = Math.min(ATTRIBUTE_HARD_MAX, result[key])
  }

  return result
}

/**
 * Tier is derived, never stored: a conjunction of level AND the class's key
 * attribute. Level sets the pace; the attribute gate only catches a character
 * built without regard for its own class.
 */
export function computeTier(level: number, keyAttributeValue: number): Tier {
  let tier: Tier = 1
  for (const gate of TIER_GATES) {
    if (level >= gate.minLevel && keyAttributeValue >= gate.minKeyAttribute) {
      tier = gate.tier
    }
  }
  return tier
}

/** Abilities active at `tier`: everything unlocked, minus anything superseded. */
export function resolveAbilities(
  all: AbilityDefinition[],
  tier: number
): AbilityDefinition[] {
  const unlocked = all.filter((a) => a.tier <= tier)
  const superseded = new Set(
    unlocked
      .map((a) => a.evolvesFrom)
      .filter((v): v is string => v !== undefined)
  )
  return unlocked.filter((a) => !superseded.has(a.value))
}
