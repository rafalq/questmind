import { z } from 'zod'

import {
  WorldDefinitionSchema,
  type Gender,
  type Genre,
  type WorldDefinition,
} from './schema'
import { treigthe } from './treigthe/definition'
import { drift } from './drift/definition'
import { neonWarszawa } from './neon-warszawa/definition'

/**
 * World registry — single source of truth for every world in QuestMind.
 * Replaces the hand-maintained per-world maps in constants/
 * (WORLDS, GENRE_BY_WORLD, RACES_BY_WORLD, CLASSES_BY_WORLD,
 * ATTRIBUTE_LABELS_BY_WORLD, WORLD_GENDER_OPTIONS).
 *
 * Definitions are validated at module load; a malformed world throws a
 * readable error at build/dev time instead of breaking the wizard at runtime.
 */

const ALL_WORLDS = [treigthe, drift, neonWarszawa]

const RegistrySchema = z
  .array(WorldDefinitionSchema)
  .min(1)
  .refine((ws) => new Set(ws.map((w) => w.value)).size === ws.length, {
    message: 'Duplicate world values in registry',
  })

const result = RegistrySchema.safeParse(ALL_WORLDS)

if (!result.success) {
  const issues = result.error.issues
    .map((i) => `  - [${i.path.join('.')}] ${i.message}`)
    .join('\n')
  throw new Error(`Invalid world definitions in registry:\n${issues}`)
}

export const WORLDS: readonly WorldDefinition[] = result.data

/** Worlds selectable in the wizard (stubs filtered out). */
export const ENABLED_WORLDS = WORLDS.filter((w) => w.enabled)

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

const WORLD_BY_VALUE = new Map(WORLDS.map((w) => [w.value, w]))

export function getWorld(worldValue: string): WorldDefinition {
  const world = WORLD_BY_VALUE.get(worldValue)
  if (!world) throw new Error(`Unknown world: "${worldValue}"`)
  return world
}

export function getRace(worldValue: string, raceValue: string) {
  const race = getWorld(worldValue).races.find((r) => r.value === raceValue)
  if (!race) {
    throw new Error(`Unknown race "${raceValue}" in world "${worldValue}"`)
  }
  return race
}

export function getClass(worldValue: string, classValue: string) {
  const cls = getWorld(worldValue).classes.find((c) => c.value === classValue)
  if (!cls) {
    throw new Error(`Unknown class "${classValue}" in world "${worldValue}"`)
  }
  return cls
}

/** Server-side genre derivation — drop-in replacement for GENRE_BY_WORLD. */
export function getGenre(worldValue: string): Genre {
  return getWorld(worldValue).genre
}

// ---------------------------------------------------------------------------
// Portraits — existing filename convention, now driven by the registry
// ---------------------------------------------------------------------------

/**
 * Builds a class portrait URL following the project convention:
 *   {base}{race}-{gender}-{class}.jpg
 * with the gender segment omitted for genderless races, e.g.
 *   stonewarden-female-last_breath_priest.jpg
 *   demigod-last_breath_priest.jpg
 *
 * Note: the CHARACTER_PORTRAITS override map (constants.ts) can stay as a
 * manual override layer on top of this convention if you use it.
 */
export function buildClassPortraitUrl(
  worldValue: string,
  raceValue: string,
  gender: Gender | null,
  classValue: string
): string {
  const world = getWorld(worldValue)
  const race = getRace(worldValue, raceValue)
  const segments = race.genderless
    ? [raceValue, classValue]
    : [raceValue, gender ?? 'male', classValue]
  return `${world.classPortraitsBaseUrl}${segments.join('-')}.jpg`
}

// ---------------------------------------------------------------------------
// App-layer validation (race/characterClass are plain text columns)
// ---------------------------------------------------------------------------

export const CharacterInputSchema = z.object({
  world: z.string().min(1),
  race: z.string().min(1),
  characterClass: z.string().min(1),
  gender: z.enum(['male', 'female']).nullable(),
  name: z.string().min(1).max(60),
})

export type CharacterInput = z.infer<typeof CharacterInputSchema>

/**
 * Cross-field validation Zod can't express cleanly: race/class must belong
 * to the world, and gender must be null iff the race is genderless.
 * Call right after parsing input in the createCharacter server action.
 */
export function assertValidCombination(input: CharacterInput): void {
  const world = getWorld(input.world)
  if (!world.enabled) {
    throw new Error(`World "${world.value}" is not playable yet`)
  }

  const race = getRace(input.world, input.race)
  getClass(input.world, input.characterClass) // throws if invalid

  if (race.genderless && input.gender !== null) {
    throw new Error(`Race "${race.value}" is genderless — gender must be null`)
  }
  if (!race.genderless && input.gender === null) {
    throw new Error(`Race "${race.value}" requires a gender`)
  }
}

export * from './campaign-brief'
export * from './schema'
