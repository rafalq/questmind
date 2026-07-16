'use server'

import { db } from '@/db'
import {
  campaignCharactersTable,
  campaignsTable,
  characterAttributesTable,
  charactersTable,
  GameSnapshot,
  messagesTable,
  sessionsTable,
} from '@/db/schema'
import { levelFromXp } from '@/features/character/constants/progression'
import { authActionClient } from '@/lib/safe-action'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getWorld } from '@/worlds'
import {
  effectiveAttributes,
  computeTier,
} from '@/features/character/lib/progression'
import { calculateMaxHp } from '@/features/character/lib/hp'
import type { Attribute } from '@/worlds/schema'
import { getBaseAttributes } from '@/features/character/queries/get-base-attributes'

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

    const baseAttributes = await getBaseAttributes(characterId)

    const classDef = getWorld(character.world).classes.find(
      (c) => c.value === character.characterClass
    )
    if (!classDef)
      throw new Error('Character class not found in world registry.')

    // Progression is derived, never stored: xp is the only source of truth.
    const level = levelFromXp(character.characterXp)
    const attributes = effectiveAttributes(baseAttributes, classDef, level)
    const tier = computeTier(level, attributes[classDef.keyAttribute])

    const maxHp = calculateMaxHp(attributes.endurance)

    const initialSnapshot: GameSnapshot = {
      hp: maxHp,
      maxHp,
      inventory: character.inventory,
      quests: [],
      sceneTag: 'default',
      xp: character.characterXp,
      level,
      tier,
      capstoneUsed: false,
    }

    const [session] = await db
      .insert(sessionsTable)
      .values({ userId, campaignId, characterId })
      .returning()

    await Promise.all([
      db
        .insert(campaignCharactersTable)
        .values({
          campaignId,
          characterId,
          currentHp: maxHp,
          maxHp,
          status: 'active',
        })
        .onConflictDoNothing(),
      // First snapshot — establishes HP truth for panel AND model from turn one.
      db.insert(messagesTable).values({
        sessionId: session.id,
        role: 'assistant',
        content: '', // no narrative; opening is generated separately
        snapshot: initialSnapshot,
      }),
    ])

    return { sessionId: session.id }
  })
