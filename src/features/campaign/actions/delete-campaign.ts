'use server'

// src/features/campaign/actions/delete-campaign.ts

import { db } from '@/db'
import { campaignsTable, campaignCharactersTable } from '@/db/schema'
import { authActionClient } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'
import { eq, and, sql } from 'drizzle-orm'
import { uuid, z } from 'zod'
import { DEFAULT_MAX_HP } from '@/features/character/lib/hp'

const schema = z.object({
  id: uuid(),
})

export const deleteCampaign = authActionClient
  .inputSchema(schema)
  .metadata({ actionName: 'deleteCampaign' })
  .action(async ({ parsedInput, ctx }) => {
    // ── 1. Verify ownership ──────────────────────────────────────────────

    const campaign = await db.query.campaignsTable.findFirst({
      where: and(
        eq(campaignsTable.id, parsedInput.id),
        eq(campaignsTable.userId, ctx.userId)
      ),
    })

    if (!campaign) {
      throw new Error('Campaign not found or access denied')
    }

    // ── 2. Reset characters linked to this campaign ──────────────────────
    // - campaignId → NULL (sql`null` required — Drizzle rejects plain null)
    // - status → 'completed'
    // - currentHp and maxHp → DEFAULT_MAX_HP (reset for next campaign)
    //
    // Ideally currentHp/maxHp would be recalculated from the character's
    // actual endurance attribute here. For now DEFAULT_MAX_HP is used.
    // TODO: join characterAttributesTable to get real endurance per character

    await db
      .update(campaignCharactersTable)
      .set({
        campaignId: sql`null`,
        status: 'completed',
        currentHp: DEFAULT_MAX_HP,
        maxHp: DEFAULT_MAX_HP,
      })
      .where(eq(campaignCharactersTable.campaignId, parsedInput.id))

    // ── 3. Delete the campaign ───────────────────────────────────────────
    // Sessions and messages keep their rows with campaignId: null
    // via onDelete: 'set null' on sessionsTable.campaignId.

    await db
      .delete(campaignsTable)
      .where(
        and(
          eq(campaignsTable.id, parsedInput.id),
          eq(campaignsTable.userId, ctx.userId)
        )
      )

    revalidatePath('/dashboard')
  })
