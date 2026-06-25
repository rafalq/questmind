import { createSafeActionClient } from 'next-safe-action'
import { auth } from '@clerk/nextjs/server'
import z from 'zod'

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    })
  },
  handleServerError(error) {
    switch (error.constructor.name) {
      case 'NeonDbError':
        return 'Database error: Your data did not save. Please try again.'
      default:
        console.error('Unexpected error:', error.message)
        return 'An unexpected error occurred. Please try again.'
    }
  },
})

export const authActionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    })
  },
  handleServerError(error) {
    switch (error.constructor.name) {
      case 'NeonDbError':
        return 'Database error: Your data did not save. Please try again.'
      default:
        console.error('Unexpected error:', error.message)
        return 'An unexpected error occurred. Please try again.'
    }
  },
}).use(async ({ next }) => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return next({ ctx: { userId } })
})
