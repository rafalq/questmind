import { type messagesTable } from '@/db/schema'

type DbMessage = typeof messagesTable.$inferSelect

export function buildClaudeMessages(
  history: DbMessage[],
  newMessage: string
): { role: 'user' | 'assistant'; content: string }[] {
  // Map stored messages to Claude's expected format
  const historyMessages = history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  return [...historyMessages, { role: 'user', content: newMessage }]
}
