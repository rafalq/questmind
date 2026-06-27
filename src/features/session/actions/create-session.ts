'use server'

import { db } from '@/db'
import { sessionsTable, campaignsTable, charactersTable } from '@/db/schema'
import { authActionClient } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { ROUTES } from '@/constants/routes'

const schema = z.object({
  campaignId: z.string().uuid(),
  characterId: z.string().uuid(),
})

export const createSession = authActionClient
  .inputSchema(schema)
  .metadata({ actionName: 'createSession' })
  .action(async ({ parsedInput, ctx }) => {
    const { campaignId, characterId } = parsedInput
    const { userId } = ctx

    // Check if the campaign belongs to the user
    const [campaign] = await db
      .select()
      .from(campaignsTable)
      .where(
        and(
          eq(campaignsTable.id, campaignId),
          eq(campaignsTable.userId, userId)
        )
      )

    if (!campaign) throw new Error('Campaign not found.')

    // Check if the character belongs to the user and has the same genre
    const [character] = await db
      .select()
      .from(charactersTable)
      .where(
        and(
          eq(charactersTable.id, characterId),
          eq(charactersTable.userId, userId)
        )
      )

    if (!character) throw new Error('Character not found.')
    if (character.genre !== campaign.genre) {
      throw new Error('Character genre does not match campaign genre.')
    }

    // Check if there is already an active session for this campaign
    const [existingSession] = await db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.campaignId, campaignId),
          eq(sessionsTable.status, 'active')
        )
      )

    if (existingSession)
      throw new Error('This campaign already has an active session.')

    // Create a new session
    const [session] = await db
      .insert(sessionsTable)
      .values({ userId, campaignId, characterId })
      .returning()

    revalidatePath(ROUTES.dashboard)

    return { sessionId: session.id }
  })
