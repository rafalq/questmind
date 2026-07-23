import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/db'
import { messagesTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import { getLanguage } from '@/features/campaign/constants/languages'
import { genderToGrammar } from './build-system-prompt/section-builders'
import { buildSystemPrompt, SEPARATOR } from './build-system-prompt/'
import { AI_MODEL, MAX_TOKENS } from '@/lib/ai/config'
import { AbilityDefinition } from '@/worlds/schema'
import { type Genre } from '@/worlds/schema/primitives'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export type OpeningInput = {
  sessionId: string
  campaignId: string
  world: string
  genre: Genre
  language: string
  characterName: string
  characterClass: string
  characterRace: string
  gender: string | null
  abilities: AbilityDefinition[]
  history: Message[]
  lastSnapshot: GameSnapshot | null
}

// Language line appended to both intro and recap prompts. Stated for every
// language including English, which used to be left implicit on the grounds
// that it is the model's default. It is not the default here: the narration
// rules the opening ships with teach naming and punctuation through Polish
// examples, and an English campaign given no instruction followed them.
//
// This line matters more than the system prompt's equivalent. The opening is
// saved into session history, and on later turns the model follows the
// language of that history far more strongly than any instruction — so the
// first message decides the language of the whole session.
function languageLine(language: string): string {
  const { promptName } = getLanguage(language)
  return `Write everything in ${promptName}. Every word of narrative, dialogue and description must be in ${promptName}.`
}

// Grammatical-gender line for both prompts. Matters most in the intro/recap
// because they're written in the PAST tense, where Polish verbs and
// participles inflect for gender ("klęczał" vs "klęczała") — the present-tense
// gameplay narration mostly doesn't.
function genderLine(gender: string | null, characterName: string): string {
  const grammar = genderToGrammar(gender)
  return `Grammatical gender: ${characterName} is ${grammar}; in gendered languages every verb, adjective and participle referring to ${characterName} must take ${grammar} forms.`
}

/**
 * Everything needed to call the model, without calling it.
 *
 * Split out of generateOpening so the streaming route can own the transport
 * while prompt construction stays in one place. Both the blocking helper below
 * and the streamed route build their request from this function, which is what
 * keeps a streamed opening identical in wording to the one this project has
 * been tuning since the interim report.
 */
export async function buildOpeningRequest(input: OpeningInput): Promise<{
  system: string
  task: string
  isNewSession: boolean
}> {
  const {
    campaignId,
    world,
    genre,
    language,
    characterName,
    characterClass,
    characterRace,
    gender,
    abilities,
    history,
    lastSnapshot,
  } = input

  // New session = the player hasn't acted yet. We can't use history.length,
  // because session creation now seeds one technical assistant message
  // (the initial HP snapshot) — so length is never 0. A user message is the
  // real signal that play has begun.
  const isNewSession = !history.some((m) => m.role === 'user')

  // The opening reads the same lore pipeline as the turn loop. It used to build
  // its own prompt from `genre` alone, which meant the model had no world to
  // open in and improvised one: it named a city that exists nowhere in the
  // seed, and invented a war in a setting whose catastrophe is the death of the
  // gods.
  //
  // variant: 'opening' omits the output contract. This message is prose only —
  // no separator, no state block — and handing the model a JSON contract it is
  // then told to ignore is a contradiction, not an instruction.
  const { prompt: system } = await buildSystemPrompt({
    genre,
    player: {
      campaignId,
      characterName,
      race: characterRace,
      characterClass,
      gender,
      world,
      abilities,
    },
    language,
    variant: 'opening',
  })

  const task = isNewSession
    ? buildIntroTask(
        language,
        characterName,
        characterClass,
        characterRace,
        gender,
        abilities,
        lastSnapshot
      )
    : buildRecapTask(language, characterName, gender, history, lastSnapshot)

  return { system, task, isNewSession }
}

/**
 * Belt and braces. The opening is prose only, and nothing in its prompt
 * describes a state block — but the model has been trained on thousands of
 * turns that end with one, and it will occasionally produce a separator plus a
 * JSON object of its own invention (`session`, `playerCharacter`,
 * `active_npcs`: none of which the parser has ever heard of). Whatever follows
 * the separator is noise by definition, so it is cut before it reaches the
 * database and the player's first screen.
 */
export function stripStateBlock(text: string, sessionId?: string): string {
  const separatorIndex = text.indexOf(SEPARATOR)
  if (separatorIndex !== -1 && sessionId) {
    console.error(
      `Opening emitted a state block for session ${sessionId} — stripped.`
    )
  }
  return (separatorIndex === -1 ? text : text.slice(0, separatorIndex)).trim()
}

/**
 * Saved without a snapshot: the opening establishes the scene, not the state.
 * The starting snapshot was written at session creation.
 *
 * Empty prose is never written. A dropped connection mid-stream would
 * otherwise persist a blank assistant message, which the "does this session
 * have an opening?" check reads as an opening — leaving the session
 * permanently without an intro.
 */
export async function persistOpening(
  sessionId: string,
  prose: string
): Promise<void> {
  if (!prose.trim()) return

  await db.insert(messagesTable).values({
    sessionId,
    role: 'assistant',
    content: prose,
    snapshot: null,
  })
}

/**
 * Blocking, non-streamed opening. No longer on the page-render path — kept
 * because it is the simplest way to produce an opening from a server context
 * that has nowhere to stream to (scripts, seeding, tests).
 */
export async function generateOpening(input: OpeningInput): Promise<string> {
  const { system, task } = await buildOpeningRequest(input)

  const response = await client.messages.create({
    model: AI_MODEL,
    // 700, not 400 — the prompt caps prose at ~200 words, but token-heavy
    // languages (e.g. Polish) overrun a 400-token ceiling and get cut
    // mid-sentence before the opening finishes.
    max_tokens: MAX_TOKENS.opening,
    system,
    messages: [{ role: 'user', content: task }],
  })

  const text = response.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')

  const prose = stripStateBlock(text, input.sessionId)
  await persistOpening(input.sessionId, prose)

  return prose
}

function buildIntroTask(
  language: string,
  characterName: string,
  characterClass: string,
  characterRace: string,
  gender: string | null,
  abilities: AbilityDefinition[],
  lastSnapshot: GameSnapshot | null
): string {
  // Starting equipment comes from race + class and is seeded into the initial
  // snapshot at session creation — the GM must not invent or ignore it.
  const equipmentText =
    lastSnapshot && lastSnapshot.inventory.length > 0
      ? `${characterName} carries: ${lastSnapshot.inventory.join(', ')}. Weave one or two of these items naturally into the scene. Do not invent additional possessions.`
      : ''

  // Names only, no gmGuidance: the opening is prose, not adjudication. This
  // colours who the character is without inviting the GM to open on a spell.
  const abilitiesText =
    abilities.length > 0
      ? `${characterName} is capable of: ${abilities.map((a) => a.name).join(', ')}. Let this colour who they are; do not have them use these powers in the opening.`
      : ''

  return `Write a short atmospheric opening for a new session in the world described above.
The player's character is ${characterName}, a ${characterRace} ${characterClass}. ${equipmentText} ${abilitiesText}
Set the scene in the starting location given above. Use only places, factions and events established in the world description — never invent a city, region or historical event of your own. If you need somewhere specific for the character to stand, choose a corner of an established location rather than a new one.
Begin with a single short evocative title line using "# " (one line only), then write 2-3 paragraphs in the style of a book opening — set the scene, establish the mood, and end with the character ready to act.
Formatting: use only plain prose, plus that one "# " title line and *italic* for occasional emphasis. Do not use bold, headers beyond the single title, lists, tables, links, or any other markdown.
Your reply ends when the prose ends. Do not append a separator line, a JSON object, or any machine-readable block of any kind — this message is narration only.
Do not ask the player what they want to do. Do not state any numbers, stats or mechanical values in the prose. Keep the prose under 200 words.
${genderLine(gender, characterName)}
${languageLine(language)}`
}

function buildRecapTask(
  language: string,
  characterName: string,
  gender: string | null,
  history: Message[],
  lastSnapshot: GameSnapshot | null
): string {
  const historyText = history
    .filter((m) => m.content !== '') // skip the technical initial-snapshot message
    .map(
      (m) =>
        `${m.role === 'user' ? characterName : 'Game Master'}: ${m.content}`
    )
    .join('\n')

  const stateText = lastSnapshot
    ? `Current state — HP: ${lastSnapshot.hp}/${lastSnapshot.maxHp}, Inventory: ${lastSnapshot.inventory.join(', ') || 'nothing'}, Active quests: ${
        lastSnapshot.quests
          .filter((q) => q.status === 'active')
          .map((q) => q.title)
          .join(', ') || 'none'
      }.`
    : ''

  return `The player is returning after a break. Write a short recap of what happened so far — like a "previously on..." summary.
Draw only on the session history below and the world described above. Do not introduce events, places or characters that appear in neither.
Write plain prose only. No markdown whatsoever: no asterisks, no hash symbols,
no headers, no bold or italic markers, no title or heading line. Begin directly
with the opening prose.
Keep it under 150 words, past tense, atmospheric. Remind them where they are and what's at stake.
${stateText}

Session history:
${historyText}

Your reply ends when the prose ends. Do not append a separator line, a JSON object, or any machine-readable block of any kind. Do not ask what the player wants to do.
${genderLine(gender, characterName)}
${languageLine(language)}`
}
