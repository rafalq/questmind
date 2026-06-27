'use server'

import { db } from '@/db'
import { charactersTable } from '@/db/schema'
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
    await db
      .delete(charactersTable)
      .where(
        and(
          eq(charactersTable.id, parsedInput.id),
          eq(charactersTable.userId, ctx.userId)
        )
      )

    revalidatePath('/characters')
  })
