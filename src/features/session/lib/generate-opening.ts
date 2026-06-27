import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/db'
import { messagesTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'

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
  campaignName: string
  characterName: string
  characterClass: string
  characterRace: string
  history: Message[]
  lastSnapshot: GameSnapshot | null
}

export async function generateOpening(input: OpeningInput): Promise<string> {
  const {
    sessionId,
    genre,
    campaignName,
    characterName,
    characterClass,
    characterRace,
    history,
    lastSnapshot,
  } = input

  const isNewSession = history.length === 0

  const prompt = isNewSession
    ? buildIntroPrompt(
        genre,
        campaignName,
        characterName,
        characterClass,
        characterRace
      )
    : buildRecapPrompt(
        genre,
        campaignName,
        characterName,
        history,
        lastSnapshot
      )

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
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
  campaignName: string,
  characterName: string,
  characterClass: string,
  characterRace: string
): string {
  return `You are QuestMind, an AI Game Master. Write a short atmospheric opening for a new ${genre} campaign called "${campaignName}". 
The player's character is ${characterName}, a ${characterRace} ${characterClass}.
Write 2-3 paragraphs in the style of a book opening — set the scene, establish the mood, and end with the character ready to act.
Do not ask the player what they want to do. Do not include any JSON. Keep it under 200 words.`
}

function buildRecapPrompt(
  genre: string,
  campaignName: string,
  characterName: string,
  history: Message[],
  lastSnapshot: GameSnapshot | null
): string {
  const historyText = history
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

  return `You are QuestMind, an AI Game Master running a ${genre} campaign called "${campaignName}".
The player is returning after a break. Write a short recap of what happened so far — like a "previously on..." summary.
Keep it under 150 words, past tense, atmospheric. Remind them where they are and what's at stake.
${stateText}

Session history:
${historyText}

Do not include any JSON. Do not ask what the player wants to do.`
}
