// src/features/session/lib/lore-writer/persist-lore-state.ts
// The write half of the RAG loop: consumes GameSnapshot.npcMet and .location,
// updates campaignLoreState. resolveLore reads the result on the next turn.

import { db } from '@/db'
import {
  campaignLoreStateTable,
  worldsTable,
  npcCharactersTable,
  locationsTable,
} from '@/db/schema/lore'
import { eq, and } from 'drizzle-orm'
import { type GameSnapshot } from '@/db/schema/session'
import { resolveNpcIds, mergeUnique } from './resolve'

type PersistInput = {
  campaignId: string
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  snapshot: GameSnapshot
}

/**
 * Never throws. The narrative has already been streamed to the player by the
 * time this runs — a failed UPDATE must not turn a turn they have read into an
 * error on their screen. A lost lore write costs the world some memory; a
 * thrown one costs the player their turn.
 */
export async function persistLoreState({
  campaignId,
  genre,
  snapshot,
}: PersistInput): Promise<void> {
  try {
    const npcMet = snapshot.npcMet ?? []
    const location = snapshot.location ?? null

    // Most turns move nobody and meet nobody. Bail before touching the DB.
    if (npcMet.length === 0 && !location) return

    const loreState = await db.query.campaignLoreStateTable.findFirst({
      where: eq(campaignLoreStateTable.campaignId, campaignId),
    })
    if (!loreState) {
      console.error(`No campaignLoreState row for campaign ${campaignId}`)
      return
    }

    const world = await db.query.worldsTable.findFirst({
      where: eq(worldsTable.genre, genre),
    })
    if (!world) return

    const patch: {
      metNpcIds?: string[]
      currentLocationSlug?: string
      visitedLocationSlugs?: string[]
      updatedAt: Date
    } = { updatedAt: new Date() }

    // ── NPCs met ───────────────────────────────────────────────────────────

    if (npcMet.length > 0) {
      const authored = await db
        .select({
          id: npcCharactersTable.id,
          name: npcCharactersTable.name,
        })
        .from(npcCharactersTable)
        .where(eq(npcCharactersTable.worldId, world.id))

      const { ids, unknown } = resolveNpcIds(npcMet, authored)

      if (unknown.length > 0) {
        // Expected, not an error: the GM improvises NPCs constantly and those
        // have no row to point at. Logged because an *authored* name landing
        // here means the model mangled it, and that is worth seeing.
        console.info(
          `Unresolved NPC names (campaign ${campaignId}): ${unknown.join(', ')}`
        )
      }

      const merged = mergeUnique(loreState.metNpcIds, ids)
      if (merged) patch.metNpcIds = merged
    }

    // ── Location ───────────────────────────────────────────────────────────

    if (location && location !== loreState.currentLocationSlug) {
      // The prompt lists the legal slugs, but a prompt is a request, not a
      // contract. An invented slug written here would make the next turn's
      // location lookup miss, and the player would silently lose every scrap
      // of location context with no error anywhere. Same discipline as
      // abilityUsed: the model proposes, the server decides.
      const target = await db.query.locationsTable.findFirst({
        where: and(
          eq(locationsTable.slug, location),
          eq(locationsTable.isActive, true)
        ),
        with: { region: true },
      })

      if (!target || target.region.worldId !== world.id) {
        console.warn(
          `Rejected unknown location slug "${location}" (campaign ${campaignId})`
        )
      } else {
        patch.currentLocationSlug = location

        const visited = mergeUnique(loreState.visitedLocationSlugs, [location])
        if (visited) patch.visitedLocationSlugs = visited
      }
    }

    // updatedAt alone is not a change worth a write.
    const hasChange = Object.keys(patch).length > 1
    if (!hasChange) return

    await db
      .update(campaignLoreStateTable)
      .set(patch)
      .where(eq(campaignLoreStateTable.campaignId, campaignId))
  } catch (err) {
    console.error('persistLoreState failed:', err)
  }
}
