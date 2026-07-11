import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/db'
import { messagesTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import { getLanguage } from '@/features/campaign/constants/languages'
import { genderToGrammar } from './build-system-prompt/section-builders'
import { AI_MODEL, MAX_TOKENS } from '@/lib/ai/config'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type OpeningInput = {
  sessionId: string
  genre: string
  language: string
  characterName: string
  characterClass: string
  characterRace: string
  gender: string | null
  history: Message[]
  lastSnapshot: GameSnapshot | null
}

// Language line appended to both intro and recap prompts. Returns '' for
// English (the model's default), so the prompts stay untouched for 'en'.
// This is what stops the FIRST message from being English — the opening is
// saved into session history, and the model follows the language of that
// history far more strongly than any system instruction on later turns.
function languageLine(language: string): string {
  if (language === 'en') return ''
  return `Write everything in ${getLanguage(language).promptName}. Every word of narrative, dialogue and description must be in ${getLanguage(language).promptName}.`
}

// Grammatical-gender line for both prompts. Matters most in the intro/recap
// because they're written in the PAST tense, where Polish verbs and
// participles inflect for gender ("klęczał" vs "klęczała") — the present-tense
// gameplay narration mostly doesn't.
function genderLine(gender: string | null, characterName: string): string {
  const grammar = genderToGrammar(gender)
  return `Grammatical gender: ${characterName} is ${grammar}; in gendered languages every verb, adjective and participle referring to ${characterName} must take ${grammar} forms.`
}

export async function generateOpening(input: OpeningInput): Promise<string> {
  const {
    sessionId,
    genre,
    language,
    characterName,
    characterClass,
    characterRace,
    gender,
    history,
    lastSnapshot,
  } = input

  // New session = the player hasn't acted yet. We can't use history.length,
  // because session creation now seeds one technical assistant message
  // (the initial HP snapshot) — so length is never 0. A user message is the
  // real signal that play has begun.
  const isNewSession = !history.some((m) => m.role === 'user')

  const prompt = isNewSession
    ? buildIntroPrompt(
        genre,
        language,
        characterName,
        characterClass,
        characterRace,
        gender,
        lastSnapshot
      )
    : buildRecapPrompt(
        genre,
        language,
        characterName,
        gender,
        history,
        lastSnapshot
      )

  const response = await client.messages.create({
    model: AI_MODEL,
    // 700, not 400 — the prompt caps prose at ~200 words, but token-heavy
    // languages (e.g. Polish) overrun a 400-token ceiling and get cut
    // mid-sentence before the opening finishes.
    max_tokens: MAX_TOKENS.opening,
    messages: [{ role: 'user', content: prompt }],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  // Save as assistant message without snapshot
  await db.insert(messagesTable).values({
    sessionId,
    role: 'assistant',
    content: text,
    snapshot: null,
  })

  return text
}

function buildIntroPrompt(
  genre: string,
  language: string,
  characterName: string,
  characterClass: string,
  characterRace: string,
  gender: string | null,
  lastSnapshot: GameSnapshot | null
): string {
  // Starting equipment comes from race + class and is seeded into the initial
  // snapshot at session creation — the GM must not invent or ignore it.
  const equipmentText =
    lastSnapshot && lastSnapshot.inventory.length > 0
      ? `${characterName} carries: ${lastSnapshot.inventory.join(', ')}. Weave one or two of these items naturally into the scene. Do not invent additional possessions.`
      : ''

  return `You are QuestMind, an AI Game Master. Write a short atmospheric opening for a new ${genre}". 
The player's character is ${characterName}, a ${characterRace} ${characterClass}. ${equipmentText}
Begin with a single short evocative title line using "# " (one line only), then write 2-3 paragraphs in the style of a book opening — set the scene, establish the mood, and end with the character ready to act.
Formatting: use only plain prose, plus that one "# " title line and *italic* for occasional emphasis. Do not use bold, headers beyond the single title, lists, tables, links, or any other markdown.
Do not ask the player what they want to do. Do not include any JSON. Keep the prose under 200 words.
${genderLine(gender, characterName)}
${languageLine(language)}`
}

function buildRecapPrompt(
  genre: string,
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

  return `You are QuestMind, an AI Game Master running a ${genre}".
The player is returning after a break. Write a short recap of what happened so far — like a "previously on..." summary.
Write plain prose only. No markdown whatsoever: no asterisks, no hash symbols,
no headers, no bold or italic markers, no title or heading line. Begin directly
with the opening prose.
Keep it under 150 words, past tense, atmospheric. Remind them where they are and what's at stake.
${stateText}

Session history:
${historyText}

Do not include any JSON. Do not ask what the player wants to do.
${genderLine(gender, characterName)}
${languageLine(language)}`
}
