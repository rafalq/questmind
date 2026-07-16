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
    const startingLocation = getStartingLocationByGenre(parsedInput.genre)

    await db.insert(campaignLoreStateTable).values({
      campaignId: campaign.id,
      currentLocationSlug: startingLocation,
      // Seeded into the visit history too. The write layer only appends on a
      // *move*, and arriving where you already are is not a move — so without
      // this the starting city would never enter visitedLocationSlugs, and a
      // player who spent the whole campaign in Cathair Luaith would have never
      // been there. Every future reader of this column would then need to
      // special-case the current location; better to make the column true here.
      visitedLocationSlugs: [startingLocation],
      // activeNpcIds is never written — presence is derived in resolveLore
      // from npc_characters.primaryLocationId. See docs/future/data-model.md.
    })

    revalidatePath(ROUTES.dashboard)
  })
