import { db } from '@/db'
import { worldsTable, regionsTable, worldEventsTable } from '@/db/schema/lore'
import { eq, and } from 'drizzle-orm'
import type { Genre } from '@/features/character/constants'

export type WorldLore = {
  world: {
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

  // Strip the AI-only DEEPER TRUTH block from the system prompt
  const publicLore = world.systemPromptCore
    .replace(/DEEPER TRUTH \(AI only\):.*?(?=\n\n)/s, '')
    .trim()

  return {
    world: {
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
  }
}
