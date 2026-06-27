'use server'

import { db } from '@/db'
import { campaignsTable } from '@/db/schema'
import { authActionClient } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const schema = z.object({
  id: z.uuid(),
})

export const deleteCampaign = authActionClient
  .inputSchema(schema)
  .metadata({ actionName: 'deleteCampaign' })
  .action(async ({ parsedInput, ctx }) => {
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
