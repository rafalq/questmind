import type Anthropic from '@anthropic-ai/sdk'

/**
 * Second chance for a turn the model finished without emitting the state block.
 *
 * The failure is not truncation — stop_reason comes back as end_turn, well
 * inside max_tokens. The model simply wrote a paragraph that felt like an
 * ending and stopped, because a thousand tokens of narrative instruction beat
 * one line of format contract. Retrying the whole turn would regenerate the
 * prose the player has already read, so instead this asks a second, much
 * smaller question: here is the narrative that happened, here is the state it
 * happened to, return the new state.
 *
 * The shape is defined by example rather than by a duplicated schema. The
 * previous snapshot IS the contract: same keys, same types, change only what
 * the narrative justifies. Nothing to keep in sync with the main prompt.
 *
 * Returns unvalidated JSON — the caller runs it through repairSnapshot exactly
 * as it would a normal turn, so a bad recovery is no more dangerous than a bad
 * first attempt. Returns null when recovery is impossible or itself fails, and
 * never throws: a failed rescue must leave the turn exactly as it already was.
 */
export async function recoverSnapshot({
  client,
  model,
  maxTokens,
  narrative,
  lastSnapshot,
  sessionId,
}: {
  client: Anthropic
  model: string
  maxTokens: number
  narrative: string
  lastSnapshot: unknown | null
  sessionId: string
}): Promise<unknown | null> {
  // With no previous state there is no shape to imitate and nothing to update.
  if (!lastSnapshot) return null

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system:
        'You convert a finished RPG narrative into a game-state snapshot. ' +
        'Reply with a single JSON object and nothing else — no prose, no ' +
        'markdown fences, no explanation. Use exactly the keys and value types ' +
        'of the object you are given. Change only what the narrative justifies; ' +
        'leave everything else as it was. "inventory" and "quests" are complete ' +
        'lists, not deltas.',
      messages: [
        {
          role: 'user',
          content:
            `Current state:\n${JSON.stringify(lastSnapshot)}\n\n` +
            `Narrative that just happened:\n${narrative}\n\n` +
            `Return the updated state object.`,
        },
      ],
    })

    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')

    // Tolerate a stray sentence around the object: take the outermost braces.
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end <= start) {
      console.error(
        `Snapshot recovery returned no JSON object for session ${sessionId}`
      )
      return null
    }

    return JSON.parse(text.slice(start, end + 1))
  } catch (error) {
    console.error(`Snapshot recovery failed for session ${sessionId}:`, error)
    return null
  }
}
