import { db } from '@/db'
import { campaignsTable, messagesTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import { persistLoreState } from '@/features/session/lib/lore-writer/persist-lore'
import { type Genre } from '@/worlds/schema/primitives'
import { eq } from 'drizzle-orm'

type Params = {
  sessionId: string
  campaignId: string
  genre: Genre
  narrative: string
  snapshot: GameSnapshot | null
}

/**
 * Writes the finished turn: the lore the model reported, the assistant
 * message, and the campaign's last-played stamp.
 *
 * The lore write closes the RAG loop - the model reports who was met and where
 * the player went, and resolveLore reads it back on the next turn, pulling in
 * the new location's context and the NPCs who live there. The world follows
 * the player, one turn behind.
 *
 * It is awaited rather than fired and forgotten because the next request can
 * start the moment this response ends, and a lore write still in flight would
 * be read back stale. It never throws - see persistLoreState.
 *
 * The message and the stamp go in parallel: neither depends on the other, and
 * both must land before the response closes.
 */
export async function persistTurn({
  sessionId,
  campaignId,
  genre,
  narrative,
  snapshot,
}: Params): Promise<void> {
  if (snapshot) {
    await persistLoreState({ campaignId, genre, snapshot })
  }

  await Promise.all([
    db.insert(messagesTable).values({
      sessionId,
      role: 'assistant',
      content: narrative,
      snapshot,
    }),
    db
      .update(campaignsTable)
      .set({ lastPlayedAt: new Date() })
      .where(eq(campaignsTable.id, campaignId)),
  ])
}
