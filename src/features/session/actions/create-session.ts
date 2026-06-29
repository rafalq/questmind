'use server'

import { db } from '@/db'
import {
  campaignCharactersTable,
  campaignsTable,
  characterAttributesTable,
  charactersTable,
  sessionsTable,
} from '@/db/schema'
import { authActionClient } from '@/lib/safe-action'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const BASE_HP = 50
const HP_PER_ENDURANCE = 10

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
    if (character.genre !== campaign.genre)
      throw new Error('Character genre does not match campaign genre.')

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

    // Fetch endurance to calculate HP
    const [enduranceAttr] = await db
      .select()
      .from(characterAttributesTable)
      .where(
        and(
          eq(characterAttributesTable.characterId, characterId),
          eq(characterAttributesTable.attribute, 'endurance')
        )
      )

    const endurance = enduranceAttr?.baseValue ?? 0
    const maxHp = BASE_HP + endurance * HP_PER_ENDURANCE

    // Create session and campaign-character link in parallel
    const [[session]] = await Promise.all([
      db
        .insert(sessionsTable)
        .values({ userId, campaignId, characterId })
        .returning(),
      db
        .insert(campaignCharactersTable)
        .values({
          campaignId,
          characterId,
          currentHp: maxHp,
          maxHp,
          status: 'active',
        })
        .onConflictDoNothing(), // safe if record already exists
    ])

    return { sessionId: session.id }
  })
