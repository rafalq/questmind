/**
 * Shared separator-aware streaming, used by both the opening and the turn loop.
 *
 * Both face the same problem: the model emits prose, then a separator, then a
 * machine-readable block, and only the prose may reach the player. The
 * separator can arrive split across two deltas, so a naive `indexOf` on each
 * chunk leaks a partial "---JSON" into the narrative, and a fragment already
 * painted on screen cannot be taken back.
 */

/**
 * The text carried by a content_block_delta, or null for every other event in
 * the SDK's union.
 *
 * The parameter is `unknown` rather than the SDK's event type on purpose. A
 * structural type loose enough to accept the whole union is also an all-
 * optional type, which TypeScript treats as a weak type and rejects for the
 * variants that share no properties with it (message_delta carries a `delta`
 * with neither `type` nor `text`). Narrowing at the boundary is honest about
 * what this module actually knows and does not chase the SDK across versions.
 */
function textDelta(event: unknown): string | null {
  const e = event as { type?: string; delta?: unknown }
  if (e?.type !== 'content_block_delta') return null

  const delta = e.delta as { type?: string; text?: string } | undefined
  return delta?.type === 'text_delta' ? (delta.text ?? '') : null
}

/**
 * Length of the trailing run of characters that could still grow into
 * `separator`. Returns 0 for anything that cannot possibly be mid-separator,
 * which is every ordinary chunk of prose.
 *
 * This replaces withholding the last `separator.length - 1` characters
 * unconditionally, which was too blunt: it kept the visible text a fixed
 * distance behind the model on every delta, so the prose looked like it had
 * stopped short of where it had actually reached. The tail is now withheld
 * only when it really is a prefix of the separator.
 */
export function pendingPrefixLength(text: string, separator: string): number {
  const max = Math.min(separator.length - 1, text.length)
  for (let n = max; n > 0; n--) {
    if (text.endsWith(separator.slice(0, n))) return n
  }
  return 0
}

type Params = {
  events: AsyncIterable<unknown>
  separator: string
  /** Called with each newly safe run of prose, in order. */
  emit: (text: string) => void
}

/**
 * Consumes the model stream, emitting only the prose that precedes
 * `separator`, and returns everything the model produced.
 *
 * The full text is returned rather than just the prose because the caller
 * still needs the tail: the state block is parsed from it, and when no
 * separator ever arrives the tail is the evidence for why.
 */
export async function streamUntilSeparator({
  events,
  separator,
  emit,
}: Params): Promise<{ full: string; separatorIndex: number }> {
  let full = ''
  let sent = 0
  let separatorIndex = -1

  const flush = (upTo: number) => {
    if (upTo > sent) {
      emit(full.slice(sent, upTo))
      sent = upTo
    }
  }

  for await (const event of events) {
    const text = textDelta(event)
    if (text === null) continue

    full += text
    if (separatorIndex !== -1) continue

    const idx = full.indexOf(separator)
    if (idx !== -1) {
      // The state block has started. Emit the prose before it and stop
      // emitting; the rest is accumulated for the caller to parse.
      flush(idx)
      separatorIndex = idx
      continue
    }

    flush(full.length - pendingPrefixLength(full, separator))
  }

  // No separator ever arrived, so the characters being held back were never a
  // separator - they were the end of a sentence. Releasing them here is what
  // stops the client seeing prose end mid-word while the database holds the
  // full text: two different narratives for one turn.
  if (separatorIndex === -1) flush(full.length)

  return { full, separatorIndex }
}
