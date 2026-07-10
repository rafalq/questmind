'use server'

import { db } from '@/db'
import { campaignsTable } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { authActionClient } from '@/lib/safe-action'
import { z } from 'zod'

const schema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(100),
})

export const renameCampaign = authActionClient
  .inputSchema(schema)
  .metadata({ actionName: 'renameCampaign' })
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(campaignsTable)
      .set({ name: parsedInput.name, updatedAt: new Date() })
      .where(
        and(
          eq(campaignsTable.id, parsedInput.id),
          eq(campaignsTable.userId, ctx.userId)
        )
      )

    revalidatePath('/dashboard')
  })
