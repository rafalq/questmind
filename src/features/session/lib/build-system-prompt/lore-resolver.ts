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
import { eq, and, ne } from 'drizzle-orm'
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
  const droppedSecretHints = loreState?.droppedSecretHints ?? []
  // activeNpcIds is NOT read: nothing ever wrote it, so it was permanently []
  // and npcBlock was permanently empty — the model has never seen an authored
  // NPC. Presence is derived below from primaryLocationId instead, which is
  // already correct in the seed and needs no write path to stay correct.

  // ── World core ───────────────────────────────────────────────────────────

  const world = await db.query.worldsTable.findFirst({
    where: eq(worldsTable.genre, genre),
  })

  if (!world) throw new Error(`World not found for genre: ${genre}`)

  // ── Known locations — the closed set the model may emit as `location` ────
  // Same discipline as sceneTag. A hallucinated slug gets written to
  // campaignLoreState.currentLocationSlug, and the next turn's lookup then
  // returns nothing: locationBlock is silently empty and the player loses all
  // location context with no error anywhere. The enum is the contract.
  const activeLocations = await db.query.locationsTable.findMany({
    where: eq(locationsTable.isActive, true),
    with: { region: true },
  })

  const worldLocations = activeLocations.filter(
    (l) => l.region.worldId === world.id
  )

  const knownLocationsBlock =
    worldLocations.length > 0
      ? `## KNOWN LOCATIONS\nThe only values the "location" field may take.\n${worldLocations
          .map(
            (l) =>
              `- ${l.slug} — ${l.name}${l.nameTranslation ? ` (${l.nameTranslation})` : ''}`
          )
          .join('\n')}`
      : ''

  // ── Current location ─────────────────────────────────────────────────────

  const secretLore: string[] = []
  let locationBlock = ''
  let currentLocationId: string | null = null

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
      currentLocationId = location.id
      locationBlock = buildLocationBlock(location, player, secretLore)
    }
  }

  // ── Present NPCs ─────────────────────────────────────────────────────────
  // Presence follows the player: whoever calls the current location home is in
  // scene. This is what closes the loop — the write layer moves the player, and
  // the cast changes by itself on the next turn. No second column to keep in
  // sync, and no chance of a stale activeNpcIds pointing at a city the player
  // left three turns ago.
  //
  // `hidden` NPCs are excluded on purpose. Canncaillte is written to be found,
  // not met: inject him whenever the player stands in Cathair Luaith and the GM
  // will simply walk him over on turn one, spending a character designed as a
  // reward for looking. He must enter through the story, not through presence.

  let npcBlock = ''

  if (currentLocationId) {
    const npcs = await db.query.npcCharactersTable.findMany({
      where: and(
        eq(npcCharactersTable.primaryLocationId, currentLocationId),
        eq(npcCharactersTable.isActive, true),
        ne(npcCharactersTable.role, 'hidden')
      ),
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
    knownLocationsBlock,
    npcBlock,
    eventsBlock,
    secretLore,
    droppedSecretHints,
  }
}
