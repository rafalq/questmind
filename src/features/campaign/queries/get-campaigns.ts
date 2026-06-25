import { db } from '@/db'
import { campaignsTable } from '@/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'

export async function getCampaigns() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  return db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.userId, userId))
    .orderBy(campaignsTable.createdAt)
}
