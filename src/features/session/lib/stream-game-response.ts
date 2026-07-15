import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/db'
import {
  campaignsTable,
  messagesTable,
  campaignCharactersTable,
} from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { type GameSnapshot } from '@/db/schema/session'
import { type SessionContext } from './validate-session'
import { buildSystemPrompt, SEPARATOR } from './build-system-prompt/'
import { SNAPSHOT_DELIMITER } from './stream-protocol'
import { getLanguage } from '@/features/campaign/constants/languages'
import { AI_MODEL, MAX_TOKENS } from '@/lib/ai/config'
import { getWorld } from '@/worlds'
import { resolveAbilities } from '@/features/character/lib/progression'
import { charactersTable } from '@/db/schema'
import {
  effectiveAttributes,
  computeTier,
} from '@/features/character/lib/progression'
import {
  levelFromXp,
  XP_PER_TURN,
} from '@/features/character/constants/progression'
import { calculateMaxHp } from '@/features/character/lib/hp'
import { persistLoreState } from '@/features/session/lib/lore-writer/persist-lore'

const client = new Anthropic()

type StreamInput = {
  sessionId: string
  context: SessionContext
  claudeMessages: { role: 'user' | 'assistant'; content: string }[]
}

export function streamGameResponse({
  sessionId,
  context,
  claudeMessages,
}: StreamInput): Response {
  const {
    campaign,
    character,
    campaignCharacter,
    lastSnapshot,
    baseAttributes,
  } = context

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const classDef = getWorld(character.world).classes.find(
        (c) => c.value === character.characterClass
      )
      let activeAbilities = classDef
        ? resolveAbilities(classDef.abilities, lastSnapshot?.tier ?? 1)
        : []

      // Capstone spent this campaign → remove it from what the model is even offered.
      // The prompt renders this list verbatim; the model never sees a used capstone,
      // so it can't narrate it. Server-side abilityUsed validation below is the backstop.
      if (campaignCharacter.capstoneUsed) {
        activeAbilities = activeAbilities.filter((a) => !a.capstone)
      }
      const systemPrompt = await buildSystemPrompt({
        genre: campaign.genre as 'fantasy' | 'sci-fi' | 'cyberpunk',
        player: {
          campaignId: campaign.id,
          characterName: character.name,
          race: character.race,
          characterClass: character.characterClass,
          gender: character.gender,
          world: character.world,
          abilities: activeAbilities,
        },
        language: campaign.language,
      })
      // Base prompt + optional current-state blob (both English).
      const baseSystem = lastSnapshot
        ? `${systemPrompt}\n\nCurrent game state:\n${JSON.stringify(lastSnapshot)}`
        : systemPrompt

      // Terminal reminder of the output contract. The language directive below
      // was added because recency was pulling narration back into English —
      // and it worked, but it worked too well: as the last thing the model
      // read, it left "write beautiful Polish prose" as the whole of its final
      // instruction, and the model would finish a paragraph and stop. Prose,
      // end_turn, no separator, no JSON — a turn that mechanically never
      // happened, at ~470 tokens out of 2048.
      //
      // Recency is a single slot and both instructions want it. So the format
      // contract goes last: it is the one whose absence silently destroys the
      // turn, while a slip in language is merely visible and recoverable.
      const languageDirective =
        campaign.language === 'en'
          ? ''
          : `\n\n---\n\nOUTPUT LANGUAGE: Write every word of narrative, dialogue and description in ${getLanguage(campaign.language).promptName}. This overrides the language of any lore or state text above. Only the machine-readable block after "${SEPARATOR}" stays in English — English keys, English values.`

      const formatDirective = `\n\n---\n\nBEFORE YOU FINISH: your reply is not complete until you have written the separator "${SEPARATOR}" on its own line, followed by the JSON state block. The prose is only half the turn — the interface reads nothing but the JSON, so a reply that ends after the narrative changes nothing in the game at all. Never end on a question to the player. Narrate, then separate, then emit the JSON.`

      const fullSystem = baseSystem + languageDirective + formatDirective

      let fullText = ''

      // Track how many characters of narrative we have already sent
      // so we can flush the remainder when the separator is found mid-chunk.
      let sentUpTo = 0

      const stream = client.messages.stream({
        model: AI_MODEL,
        max_tokens: MAX_TOKENS.turn,
        system: fullSystem,
        messages: claudeMessages,
      })

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          fullText += chunk.delta.text

          const separatorIndex = fullText.indexOf(SEPARATOR)

          if (separatorIndex === -1) {
            // Separator not yet complete in the buffer. Hold back the last
            // (SEPARATOR.length - 1) chars — they might be the beginning of a
            // separator that only finishes in a later chunk. Without this, a
            // partial "---JSON" leaks into the narrative before the closing
            // "---" arrives, because indexOf still returns -1 mid-separator.
            const safeUpTo = fullText.length - (SEPARATOR.length - 1)
            if (safeUpTo > sentUpTo) {
              controller.enqueue(
                encoder.encode(fullText.slice(sentUpTo, safeUpTo))
              )
              sentUpTo = safeUpTo
            }
          } else if (sentUpTo < separatorIndex) {
            // Separator is now complete — flush any unsent narrative that
            // sits before it (including the chars we were holding back).
            const remaining = fullText.slice(sentUpTo, separatorIndex)
            if (remaining) {
              controller.enqueue(encoder.encode(remaining))
            }
            sentUpTo = separatorIndex
            // Don't break — let the stream finish so we collect the full JSON.
          }
          // If sentUpTo >= separatorIndex we are past the separator already,
          // just accumulate the JSON tail silently.
        }
      }

      const final = await stream.finalMessage()
      console.log(
        'STOP REASON:',
        final.stop_reason,
        '| tokens:',
        final.usage.output_tokens
      )

      // ── Parse JSON snapshot ───────────────────────────────────────────

      const separatorIndex = fullText.indexOf(SEPARATOR)
      let snapshot: GameSnapshot | null = null

      // Flush the hold-back. During streaming we withhold the last
      // (SEPARATOR.length - 1) chars in case they are the start of a separator
      // that completes in a later chunk. When no separator ever arrives, those
      // chars were never a separator — they were the end of a sentence, and
      // they were silently dropped. The client saw prose ending mid-word while
      // the database held the full text: two different narratives for one turn.
      if (separatorIndex === -1 && sentUpTo < fullText.length) {
        controller.enqueue(encoder.encode(fullText.slice(sentUpTo)))
        sentUpTo = fullText.length
      }

      if (separatorIndex !== -1) {
        const jsonStr = fullText.slice(separatorIndex + SEPARATOR.length).trim()
        try {
          snapshot = JSON.parse(jsonStr)
        } catch {
          console.error('Failed to parse game snapshot:', jsonStr)
        }
      } else {
        // No separator at all. The model never emitted the state block, so this
        // turn silently updates nothing — no HP, no abilityUsed, no XP — because
        // snapshot stays null. The visible symptom is prose ending mid-word; the
        // invisible one is a turn that mechanically never happened.
        console.error(
          `No separator in model output (${fullText.length} chars) for session ${sessionId}. Snapshot lost.`
        )
        // The tail is the evidence: it shows whether the model stopped early,
        // or emitted a separator we failed to recognise — an em-dash variant
        // (—JSON—) would be invisible to indexOf while looking correct to a
        // human reading the log.
        console.error('TAIL:', JSON.stringify(fullText.slice(-150)))
      }

      // Progression is server-authoritative and deterministic. XP is awarded
      // per turn by the server, never by the model: an LLM handing out points
      // would be untestable and trivially talked up by the player. The model
      // sees xp/level/tier because they gate which abilities it may narrate,
      // but anything it sends back for these fields is discarded.
      if (snapshot && lastSnapshot && classDef) {
        const xp = lastSnapshot.xp + XP_PER_TURN
        const level = levelFromXp(xp)
        const attributes = effectiveAttributes(baseAttributes, classDef, level)

        snapshot.xp = xp
        snapshot.level = level
        snapshot.tier = computeTier(level, attributes[classDef.keyAttribute])
        // maxHp tracks endurance growth, so levelling widens the pool. Without
        // this a Bleeder's costs would rise while its HP stayed flat.
        snapshot.maxHp = calculateMaxHp(attributes.endurance)

        await db
          .update(charactersTable)
          .set({ characterXp: xp })
          .where(eq(charactersTable.id, character.id))
      }

      // The model reports which ability it narrated, but has no authority over
      // the name: anything outside the character's active set is discarded.
      // This makes hallucinated or out-of-tier abilities impossible to display
      // without relying on the model's restraint.
      if (snapshot?.abilityUsed) {
        const known = activeAbilities.some(
          (a) => a.name === snapshot!.abilityUsed
        )
        if (!known) snapshot.abilityUsed = undefined
      }

      // Burn the capstone: if this turn's ability was the capstone, mark it
      // spent for the whole campaign. activeAbilities is already filtered, so
      // used?.capstone can only be true on the FIRST use — on later turns the
      // capstone isn't in the set and this never fires. The capstoneUsed=false
      // guard in WHERE makes the write idempotent and race-safe: two turns
      // can't both spend it.
      if (snapshot?.abilityUsed) {
        const used = activeAbilities.find(
          (a) => a.name === snapshot!.abilityUsed
        )
        if (used?.capstone) {
          await db
            .update(campaignCharactersTable)
            .set({ capstoneUsed: true })
            .where(
              and(
                eq(campaignCharactersTable.id, campaignCharacter.id),
                eq(campaignCharactersTable.capstoneUsed, false)
              )
            )
        }
      }
      // ── Dynamic RAG write ─────────────────────────────────────────────
      // Closes the loop: the model reports who was met and where the player
      // went, and resolveLore reads it back on the next turn — pulling in the
      // new location's prompt context and the NPCs who live there. The world
      // follows the player, one turn behind.
      //
      // Awaited, not fire-and-forget: the next request can start the moment
      // this response ends, and a lore write still in flight would be read
      // back stale. Never throws — see persistLoreState.
      if (snapshot) {
        await persistLoreState({
          campaignId: campaign.id,
          genre: campaign.genre as 'fantasy' | 'sci-fi' | 'cyberpunk',
          snapshot,
        })
      }

      const narrative =
        separatorIndex !== -1
          ? fullText.slice(0, separatorIndex).trim()
          : fullText.trim()

      // ── Persist to database ───────────────────────────────────────────

      await Promise.all([
        db.insert(messagesTable).values({
          sessionId,
          role: 'assistant',
          content: narrative,
          snapshot,
        }),
        db
          .update(campaignsTable)
          .set({ lastPlayedAt: new Date() })
          .where(eq(campaignsTable.id, context.campaign.id)),
      ])

      // Send the parsed snapshot to the client so it can apply the delta
      // immediately — no separate refetch round-trip.
      if (snapshot) {
        controller.enqueue(
          encoder.encode(SNAPSHOT_DELIMITER + JSON.stringify(snapshot))
        )
      }

      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
