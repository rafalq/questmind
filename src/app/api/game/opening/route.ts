import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getSession } from '@/features/session/queries/get-session'
import {
  buildOpeningRequest,
  persistOpening,
  stripStateBlock,
} from '@/features/session/lib/generate-opening'
import { SEPARATOR } from '@/features/session/lib/build-system-prompt/'
import { AI_MODEL, MAX_TOKENS } from '@/lib/ai/config'
import { getWorld } from '@/worlds'
import { resolveAbilities } from '@/features/character/lib/progression'
import { type GameSnapshot } from '@/db/schema/session'

// Same runtime as /api/game. Both routes stream from the same SDK against the
// same database config, so they have to agree — running this one on Node while
// the turn loop runs on Edge would mean two sets of environment assumptions and
// a second chance to reintroduce the dotenv-in-db/index.ts crash.
export const runtime = 'edge'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const schema = z.object({ sessionId: z.string().uuid() })

// Serverless instances do not share this, so it is not a distributed lock —
// the database check below is what actually prevents a duplicate opening. This
// only stops the cheap, common case: React's development StrictMode mounting
// the effect twice and firing two requests within the same millisecond, before
// either has written anything for the other to find.
const inFlight = new Set<string>()

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const { sessionId } = parsed.data

  const data = await getSession(sessionId)
  if (!data) return new Response('Not found', { status: 404 })

  const { session, campaign, character, messages } = data

  // The session screen is a client component asking for prose on behalf of
  // whoever is holding the browser. Ownership is therefore checked here and
  // not inferred from the fact that the page rendered.
  if (session.userId !== userId) {
    return new Response('Forbidden', { status: 403 })
  }

  // Authoritative check. `needsOpening` from the page is a hint that may be
  // seconds stale; this is the read that decides whether a request is made.
  // 204 rather than an error: an opening already existing is a normal outcome
  // of a refresh, not a failure the player should see.
  const hasOpening = messages.some(
    (m) => m.role === 'assistant' && m.content !== ''
  )
  if (hasOpening || inFlight.has(sessionId)) {
    return new Response(null, { status: 204 })
  }

  const lastSnapshot = ([...messages].reverse().find((m) => m.snapshot)
    ?.snapshot ?? null) as GameSnapshot | null

  // Abilities active at the character's current tier. Resolved here rather
  // than inside buildOpeningRequest so the registry lookup stays in one place.
  const classDef = getWorld(character.world).classes.find(
    (c) => c.value === character.characterClass
  )
  const abilities = classDef
    ? resolveAbilities(classDef.abilities, lastSnapshot?.tier ?? 1)
    : []

  const { system, task } = await buildOpeningRequest({
    sessionId,
    campaignId: campaign.id,
    world: character.world,
    genre: campaign.genre,
    language: campaign.language,
    characterName: character.name,
    // Resolved label, never the raw slug: 'last_breath_priest' would
    // otherwise reach the model as narrative material.
    characterClass: classDef?.label ?? character.characterClass,
    characterRace: character.race,
    gender: character.gender,
    abilities,
    history: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    lastSnapshot,
  })

  inFlight.add(sessionId)

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Everything the model produced, separator and any invented state block
      // included. What reaches the client is a prefix of this.
      let full = ''
      // How much of the prose has already been enqueued.
      let sent = 0
      let cut = false

      const flush = (upTo: number) => {
        if (upTo > sent) {
          controller.enqueue(encoder.encode(full.slice(sent, upTo)))
          sent = upTo
        }
      }

      try {
        const modelStream = client.messages.stream({
          model: AI_MODEL,
          // 700, not 400 — the prompt caps prose at ~200 words, but
          // token-heavy languages (e.g. Polish) overrun a 400-token ceiling
          // and get cut mid-sentence before the opening finishes.
          max_tokens: MAX_TOKENS.opening,
          system,
          messages: [{ role: 'user', content: task }],
        })

        for await (const event of modelStream) {
          if (
            event.type !== 'content_block_delta' ||
            event.delta.type !== 'text_delta'
          ) {
            continue
          }

          full += event.delta.text
          if (cut) continue

          const idx = full.indexOf(SEPARATOR)
          if (idx !== -1) {
            // A state block started. Emit the prose before it and stop; the
            // rest is accumulated only so the log below can report it.
            flush(idx)
            cut = true
            continue
          }

          // Hold back the last SEPARATOR.length characters. A separator can
          // arrive split across two deltas, and once a fragment of it has been
          // painted on screen it cannot be taken back — the player would watch
          // punctuation appear under the opening paragraph.
          flush(Math.max(0, full.length - SEPARATOR.length))
        }

        // Stream finished: release whatever was being held back.
        if (!cut) flush(full.length)

        controller.close()
      } catch (error) {
        console.error(`Opening stream failed for session ${sessionId}:`, error)
        controller.error(error)
      } finally {
        // Persisted from the accumulated text, not from what the client
        // received. If the player closed the tab halfway through, the opening
        // they never saw is still the one waiting when they resume.
        try {
          await persistOpening(sessionId, stripStateBlock(full, sessionId))
        } catch (error) {
          console.error(`Failed to save opening for ${sessionId}:`, error)
        }
        inFlight.delete(sessionId)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      // Proxies that buffer a response defeat the point of streaming it.
      'X-Accel-Buffering': 'no',
    },
  })
}
