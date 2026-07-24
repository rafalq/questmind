import { getLanguage } from '@/features/campaign/constants/languages'
import { getClassDef } from '@/features/character/lib/get-class-def'
import { resolveAbilities } from '@/features/character/lib/progression'
import { type Genre } from '@/worlds/schema/primitives'
import { buildSystemPrompt, SEPARATOR } from './build-system-prompt/'
import { type SessionContext } from './validate-session'

type ClaudeMessage = { role: 'user' | 'assistant'; content: string }

type Params = {
  context: SessionContext
  claudeMessages: ClaudeMessage[]
}

/**
 * Assembles everything the model is sent for one turn: the system prompt, the
 * directives appended to it, and the transcript.
 *
 * Separated from the streaming loop because the two answer different questions
 * and fail in different ways. Everything here is deterministic string
 * assembly from the session context - no network, no database - which is what
 * makes it the part worth testing directly.
 */
export async function buildTurnRequest({ context, claudeMessages }: Params) {
  const { campaign, character, campaignCharacter, lastSnapshot } = context

  const classDef = getClassDef(character.world, character.characterClass)

  let activeAbilities = classDef
    ? resolveAbilities(classDef.abilities, lastSnapshot?.tier ?? 1)
    : []

  // Capstone spent this campaign -> remove it from what the model is even
  // offered. The prompt renders this list verbatim, so the model never sees a
  // used capstone and cannot narrate it. The server-side abilityUsed check in
  // applyTurnEffects is the backstop.
  if (campaignCharacter.capstoneUsed) {
    activeAbilities = activeAbilities.filter((a) => !a.capstone)
  }

  const { prompt: systemPrompt, validSceneTags } = await buildSystemPrompt({
    genre: campaign.genre as Genre,
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

  // Dev-only: the tag list is generated per world, and reading it here is the
  // fastest way to catch a world seeded with tags nothing renders.
  if (process.env.NODE_ENV === 'development') {
    console.log('VALID SCENE TAGS:', [...validSceneTags].join(', '))
  }

  const baseSystem = lastSnapshot
    ? `${systemPrompt}\n\nCurrent game state:\n${JSON.stringify(lastSnapshot)}`
    : systemPrompt

  const system =
    baseSystem +
    languageDirective(campaign.language) +
    formatDirective()

  return {
    system,
    messages: withFormatReminder(claudeMessages),
    activeAbilities,
    classDef,
    validSceneTags,
  }
}

/**
 * Pins the output language to the campaign's, regardless of what the player
 * types in.
 *
 * Without this the model mirrors its input: an English campaign drifts into
 * Polish the moment the player writes a Polish sentence, because nothing in
 * the (all-English) prompt actively holds narration in English. "English is
 * the model's default" stops being true the instant the most recent turn is in
 * another language.
 */
function languageDirective(language: string): string {
  if (language === 'en') {
    return `\n\n---\n\nOUTPUT LANGUAGE: Write every word of narrative, dialogue and description in English, regardless of the language the player writes in. The player may switch language at any point; always narrate back in English.`
  }

  return `\n\n---\n\nOUTPUT LANGUAGE: Write every word of narrative, dialogue and description in ${getLanguage(language).promptName}, regardless of the language the player writes in. This overrides the language of any lore or state text above, and the language of the player's own messages. Only the machine-readable block after "${SEPARATOR}" stays in English - English keys, English values.`
}

/**
 * The output contract, and the last thing in the system prompt.
 *
 * Ordering here is load-bearing. The language directive above was added
 * because recency was pulling narration back into English - and it worked, but
 * it worked too well: as the last thing the model read, it left "write
 * beautiful Polish prose" as the whole of its final instruction, and the model
 * would finish a paragraph and stop. Prose, end_turn, no separator, no JSON -
 * a turn that mechanically never happened.
 *
 * Recency is a single slot and both instructions want it. The format contract
 * takes it: it is the one whose absence silently destroys the turn, while a
 * slip in language is merely visible and recoverable.
 */
function formatDirective(): string {
  return `\n\n---\n\nBEFORE YOU FINISH: your reply is not complete until you have written the separator "${SEPARATOR}" on its own line, followed by the JSON state block. The prose is only half the turn - the interface reads nothing but the JSON, so a reply that ends after the narrative changes nothing in the game at all. Never end on a question to the player. Narrate, then separate, then emit the JSON.`
}

/**
 * Repeats the contract on the final user message.
 *
 * The system prompt ends with it, but "the end of the system prompt" is still
 * before every message in the transcript. Recency belongs to the tail of the
 * conversation, so one short line goes there too - cheap insurance against the
 * failure recoverSnapshot otherwise has to clean up.
 */
function withFormatReminder(messages: ClaudeMessage[]): ClaudeMessage[] {
  return messages.map((m, i) =>
    i === messages.length - 1 && m.role === 'user'
      ? {
          ...m,
          content: `${m.content}\n\n[Format reminder: end your reply with "${SEPARATOR}" on its own line, followed by the JSON state block.]`,
        }
      : m
  )
}
