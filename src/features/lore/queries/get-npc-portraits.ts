import { db } from '@/db'
import { npcCharactersTable, worldsTable } from '@/db/schema/lore'
import { eq, and, isNotNull } from 'drizzle-orm'
import type { Genre } from '@/features/character/constants/'

export type NpcPortrait = {
  name: string
  title: string | null
  portraitUrl: string
}

/**
 * Portraits for the authored cast of a world, keyed by lower-cased name.
 *
 * The key is the NPC's name because that is what the model returns in
 * `npcMet` — the prompt instructs it to copy names character-for-character
 * from the NPC section, so an authored NPC round-trips exactly. That only
 * holds for authored NPCs: the prompt also permits the model to invent people,
 * and those will never match. A miss here is therefore expected behaviour, not
 * an error — the caller renders what it finds and silently ignores the rest.
 *
 * Lower-cased on both sides to survive the model capitalising a name
 * differently from the seed, which costs nothing and removes a whole class of
 * near-miss.
 */
export async function getNpcPortraits(
  genre: Genre
): Promise<Record<string, NpcPortrait>> {
  const rows = await db
    .select({
      name: npcCharactersTable.name,
      title: npcCharactersTable.title,
      portraitUrl: npcCharactersTable.portraitUrl,
    })
    .from(npcCharactersTable)
    .innerJoin(worldsTable, eq(npcCharactersTable.worldId, worldsTable.id))
    .where(
      and(
        eq(worldsTable.genre, genre),
        eq(npcCharactersTable.isActive, true),
        isNotNull(npcCharactersTable.portraitUrl)
      )
    )

  return Object.fromEntries(
    rows.map((r) => [
      r.name.toLowerCase(),
      { name: r.name, title: r.title, portraitUrl: r.portraitUrl! },
    ])
  )
}
