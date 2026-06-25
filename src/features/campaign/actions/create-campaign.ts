'use server'

import { db } from '@/db'
import { campaignsTable } from '@/db/schema'
import { revalidatePath } from 'next/cache'
import { authActionClient } from '@/lib/safe-action'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
  genre: z.enum(['fantasy', 'sci-fi', 'cyberpunk']),
  description: z.string().max(500).optional(),
})

export const createCampaign = authActionClient
  .schema(schema)
  .metadata({ actionName: 'createCampaign' })
  .action(async ({ parsedInput, ctx }) => {
    await db.insert(campaignsTable).values({
      userId: ctx.userId,
      name: parsedInput.name,
      genre: parsedInput.genre,
      description: parsedInput.description ?? null,
    })

    revalidatePath('/dashboard')
  })
