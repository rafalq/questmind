import { db } from '@/db'
import {
  worldsTable,
  regionsTable,
  worldEventsTable,
  locationsTable,
  subLocationsTable,
} from '@/db/schema/lore'
import { eq, and, inArray } from 'drizzle-orm'
import type { Genre } from '@/features/character/constants/'

export type WorldLore = {
  world: {
    /** Registry key — matches WorldDefinition.value, so the modal can read
     *  races, classes and the glossary straight from the world registry
     *  instead of duplicating them in the database. */
    slug: string
    name: string
    subtitle: string
    publicLore: string // systemPromptCore stripped of DEEPER TRUTH
  }
  region: {
    name: string
    nameTranslation: string
    description: string
  } | null
  events: {
    year: number
    yearLabel: string
    title: string
    description: string
  }[]
  /** Seeded locations, in the order they were added. Read from the database
   *  rather than authored in the modal: a location added to a seed appears
   *  here on the next load, with no second list to keep in sync. */
  locations: {
    slug: string
    name: string
    nameTranslation: string
    /** Written as prose for someone who lives there — reads as a guide. */
    description: string
    subLocations: {
      name: string
      nameTranslation: string
      description: string
      atmosphere: string
    }[]
  }[]
}

export async function getWorldLore(genre: Genre): Promise<WorldLore | null> {
  const [world] = await db
    .select()
    .from(worldsTable)
    .where(eq(worldsTable.genre, genre))

  if (!world) return null

  const [region] = await db
    .select()
    .from(regionsTable)
    .where(eq(regionsTable.worldId, world.id))

  const events = await db
    .select()
    .from(worldEventsTable)
    .where(
      and(
        eq(worldEventsTable.worldId, world.id),
        eq(worldEventsTable.isTierSecret, false),
        eq(worldEventsTable.includeInPrompt, true)
      )
    )
    .orderBy(worldEventsTable.sortOrder)

  // Locations hang off the region, not the world, so this is scoped through
  // the region we just resolved. No region, no locations — and the modal
  // simply omits the section.
  const locations = region
    ? await db
        .select()
        .from(locationsTable)
        .where(
          and(
            eq(locationsTable.regionId, region.id),
            eq(locationsTable.isActive, true)
          )
        )
    : []

  // One query for every sub-location rather than one per location: the counts
  // here are small, but the N+1 would grow with the world.
  const subLocations = locations.length
    ? await db
        .select()
        .from(subLocationsTable)
        .where(
          inArray(
            subLocationsTable.locationId,
            locations.map((l) => l.id)
          )
        )
    : []

  // Strip the AI-only DEEPER TRUTH block from the system prompt
  const publicLore = world.systemPromptCore
    .replace(/DEEPER TRUTH \(AI only\):.*?(?=\n\n)/s, '')
    .trim()

  return {
    world: {
      slug: world.slug,
      name: world.name,
      subtitle: world.subtitle ?? '',
      publicLore,
    },
    region: region
      ? {
          name: region.name,
          nameTranslation: region.nameTranslation ?? '',
          description: region.description,
        }
      : null,
    events: events.map((e) => ({
      year: e.year ?? 0,
      yearLabel: e.yearLabel ?? '',
      title: e.title,
      description: e.description,
    })),
    locations: locations.map((l) => ({
      slug: l.slug,
      name: l.name,
      nameTranslation: l.nameTranslation ?? '',
      description: l.promptContext,
      subLocations: subLocations
        .filter((s) => s.locationId === l.id)
        .map((s) => ({
          name: s.name,
          nameTranslation: s.nameTranslation ?? '',
          description: s.description,
          atmosphere: s.atmosphere ?? '',
        })),
    })),
  }
}
