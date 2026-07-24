import { type GameSnapshot } from '@/db/schema/session'
import { getClassDef } from '@/features/character/lib/get-class-def'
import { resolveAbilities } from '@/features/character/lib/progression'
import { buildOpeningRequest } from '@/features/session/lib/generate-opening'
import {
  isOpeningInFlight,
  streamOpeningResponse,
} from '@/features/session/lib/stream-opening-response'
import { getSession } from '@/features/session/queries/get-session'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'

// Same runtime as /api/game. Both routes stream from the same SDK against the
// same database config, so they have to agree - running this one on Node while
// the turn loop runs on Edge would mean two sets of environment assumptions and
// a second chance to reintroduce the dotenv-in-db/index.ts crash.
export const runtime = 'edge'

const schema = z.object({ sessionId: z.string().uuid() })

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
  if (hasOpening || isOpeningInFlight(sessionId)) {
    return new Response(null, { status: 204 })
  }

  const lastSnapshot = ([...messages].reverse().find((m) => m.snapshot)
    ?.snapshot ?? null) as GameSnapshot | null

  // Abilities active at the character's current tier. Resolved here rather
  // than inside buildOpeningRequest so the registry lookup stays in one place.
  const classDef = getClassDef(character.world, character.characterClass)
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

  return streamOpeningResponse({ sessionId, system, task })
}
