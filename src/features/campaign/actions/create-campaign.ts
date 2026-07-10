'use server'

import { db } from '@/db'
import { campaignsTable } from '@/db/schema'
import { campaignLoreStateTable } from '@/db/schema/lore'
import { getStartingLocationByGenre } from '@/worlds/get-starting-location'
import { revalidatePath } from 'next/cache'
import { authActionClient } from '@/lib/safe-action'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
  genre: z.enum(['fantasy', 'sci-fi', 'cyberpunk']),
  description: z.string().max(500).optional(),
})

export const createCampaign = authActionClient
  .inputSchema(schema)
  .metadata({ actionName: 'createCampaign' })
  .action(async ({ parsedInput, ctx }) => {
    const [campaign] = await db
      .insert(campaignsTable)
      .values({
        userId: ctx.userId,
        name: parsedInput.name,
        genre: parsedInput.genre,
        description: parsedInput.description ?? null,
      })
      .returning({ id: campaignsTable.id })

    // Seed the lore-state row so resolveLore has a starting location to pull
    // scene context from on the very first turn (B-lite RAG entry point).
    await db.insert(campaignLoreStateTable).values({
      campaignId: campaign.id,
      currentLocationSlug: getStartingLocationByGenre(parsedInput.genre),
      // activeNpcIds stays [] — populated by the write layer (step 3)
    })

    revalidatePath('/dashboard')
  })
