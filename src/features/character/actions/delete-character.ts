'use server'

import { ROUTES } from '@/constants/routes'
// src/features/character/actions/delete-character.ts
//
// Flow:
// 1. Verify character belongs to the current user
// 2. Find the campaign this character is in (if any)
// 3. Delete the campaign — sessions/messages stay with campaignId: null
//    (sessionsTable must have campaignId as nullable with onDelete: 'set null')
// 4. Delete the character — cascades to campaignCharactersTable and characterAttributesTable
// 5. Revalidate

import { db } from '@/db'
import { charactersTable, campaignCharactersTable } from '@/db/schema'
import { campaignsTable } from '@/db/schema'
import { authActionClient } from '@/lib/safe-action'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  id: z.uuid(),
})

export const deleteCharacter = authActionClient
  .inputSchema(schema)
  .metadata({ actionName: 'deleteCharacter' })
  .action(async ({ parsedInput, ctx }) => {
    // ── 1. Verify ownership ──────────────────────────────────────────────

    const character = await db.query.charactersTable.findFirst({
      where: and(
        eq(charactersTable.id, parsedInput.id),
        eq(charactersTable.userId, ctx.userId)
      ),
    })

    if (!character) {
      throw new Error('Character not found or access denied')
    }

    // ── 2. Find associated campaign ──────────────────────────────────────

    const campaignCharacter = await db.query.campaignCharactersTable.findFirst({
      where: eq(campaignCharactersTable.characterId, parsedInput.id),
    })

    // ── 3. Delete the campaign if one exists ─────────────────────────────
    // Sessions and messages are preserved — their campaignId becomes null
    // via the onDelete: 'set null' constraint on sessionsTable.campaignId.

    if (campaignCharacter?.campaignId) {
      await db
        .delete(campaignsTable)
        .where(eq(campaignsTable.id, campaignCharacter.campaignId))
    }

    // ── 4. Delete the character ──────────────────────────────────────────
    // Cascades to:
    // - campaignCharactersTable (onDelete: cascade)
    // - characterAttributesTable (onDelete: cascade)

    await db
      .delete(charactersTable)
      .where(
        and(
          eq(charactersTable.id, parsedInput.id),
          eq(charactersTable.userId, ctx.userId)
        )
      )

    // ── 5. Revalidate ────────────────────────────────────────────────────

    revalidatePath(ROUTES.dashboard)
  })
