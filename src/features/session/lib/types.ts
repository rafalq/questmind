import { type GameSnapshot } from '@/db/schema/session'

export type UIMessage = {
  role: 'user' | 'assistant'
  content: string
  /** Snapshot as of this message. Null for user messages and pre-snapshot history. */
  snapshot?: GameSnapshot | null
}
