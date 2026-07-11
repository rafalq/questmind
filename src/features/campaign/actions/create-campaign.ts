'use server'

import { ROUTES } from '@/constants/routes'
import { db } from '@/db'
import { campaignsTable } from '@/db/schema'
import { campaignLoreStateTable } from '@/db/schema/lore'
import { authActionClient } from '@/lib/safe-action'
import { getStartingLocationByGenre } from '@/worlds/get-starting-location'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { LANGUAGE_CODES } from '../constants/languages'

const schema = z.object({
  name: z.string().min(1).max(100),
  genre: z.enum(['fantasy', 'sci-fi', 'cyberpunk']),
  description: z.string().max(500).optional(),
  language: z.enum(LANGUAGE_CODES),
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
        language: parsedInput.language,
      })
      .returning({ id: campaignsTable.id })

    // Seed the lore-state row so resolveLore has a starting location to pull
    // scene context from on the very first turn (B-lite RAG entry point).
    await db.insert(campaignLoreStateTable).values({
      campaignId: campaign.id,
      currentLocationSlug: getStartingLocationByGenre(parsedInput.genre),
      // activeNpcIds stays [] — populated by the write layer (step 3)
    })

    revalidatePath(ROUTES.dashboard)
  })
