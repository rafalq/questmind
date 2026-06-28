// src/features/game/lib/build-system-prompt/lore-resolver.ts
// All database queries for the lore system.
// Returns raw data — section-builders.ts handles formatting.

import { db } from '@/db'
import {
  worldsTable,
  locationsTable,
  npcCharactersTable,
  worldEventsTable,
  campaignLoreStateTable,
} from '@/db/schema/lore'
import { eq, inArray, and } from 'drizzle-orm'
import type { BuildPromptOptions, ResolvedLore } from './'
import { buildLocationBlock, buildNpcBlock } from './section-builders'

export async function resolveLore(
  options: BuildPromptOptions
): Promise<ResolvedLore> {
  const { genre, player } = options

  // ── Campaign lore state ──────────────────────────────────────────────────

  const loreState = await db.query.campaignLoreStateTable.findFirst({
    where: eq(campaignLoreStateTable.campaignId, player.campaignId),
  })

  const currentLocationSlug = loreState?.currentLocationSlug ?? null
  const activeNpcIds = loreState?.activeNpcIds ?? []
  const droppedSecretHints = loreState?.droppedSecretHints ?? []

  // ── World core ───────────────────────────────────────────────────────────

  const world = await db.query.worldsTable.findFirst({
    where: eq(worldsTable.genre, genre),
  })

  if (!world) throw new Error(`World not found for genre: ${genre}`)

  // ── Current location ─────────────────────────────────────────────────────

  const secretLore: string[] = []
  let locationBlock = ''

  if (currentLocationSlug) {
    const location = await db.query.locationsTable.findFirst({
      where: eq(locationsTable.slug, currentLocationSlug),
      with: {
        subLocations: {
          with: { lore: true },
        },
      },
    })

    if (location) {
      locationBlock = buildLocationBlock(location, player, secretLore)
    }
  }

  // ── Active NPCs ──────────────────────────────────────────────────────────

  let npcBlock = ''

  if (activeNpcIds.length > 0) {
    const npcs = await db.query.npcCharactersTable.findMany({
      where: inArray(npcCharactersTable.id, activeNpcIds),
      with: { lore: true },
    })

    npcBlock = buildNpcBlock(npcs, player, secretLore)
  }

  // ── Key world events (flagged for prompt inclusion, capped at 8) ─────────

  const keyEvents = await db.query.worldEventsTable.findMany({
    where: and(
      eq(worldEventsTable.worldId, world.id),
      eq(worldEventsTable.includeInPrompt, true)
    ),
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
    limit: 8,
  })

  const eventsBlock =
    keyEvents.length > 0
      ? `## KEY WORLD EVENTS\n${keyEvents
          .map(
            (e) =>
              `- ${e.yearLabel ?? `Year ${e.year}`}: ${e.title}. ${e.description}`
          )
          .join('\n')}`
      : ''

  return {
    worldCore: world.systemPromptCore,
    locationBlock,
    npcBlock,
    eventsBlock,
    secretLore,
    droppedSecretHints,
  }
}
