import { db } from '@/db'
import { sessionsTable } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

export async function getActiveSession(campaignId: string) {
  const { userId } = await auth()
  if (!userId) return null

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.campaignId, campaignId),
        eq(sessionsTable.userId, userId),
        eq(sessionsTable.status, 'active')
      )
    )

  return session ?? null
}
