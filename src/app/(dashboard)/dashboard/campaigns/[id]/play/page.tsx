import { getSession } from '@/features/session/queries/get-session'
import { generateOpening } from '@/features/session/lib/generate-opening'
import GameScreen from '@/features/session/components/game-screen'
import { notFound } from 'next/navigation'
import { type GameSnapshot } from '@/db/schema/session'
import { getWorld } from '@/worlds'
import { resolveAbilities } from '@/features/character/lib/progression'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sessionId?: string }>
}

export default async function PlayPage({ params, searchParams }: Props) {
  const { id } = await params
  const { sessionId } = await searchParams

  if (!sessionId) notFound()

  const data = await getSession(sessionId)
  if (!data) notFound()

  const { session, campaign, character, messages } = data

  /// A real opening is an assistant message WITH narrative content.
  // The initial-snapshot message createSession seeds is role:'assistant'
  // but content:'' — it must not count as an opening, or generateOpening
  // never fires and the intro is missing.
  const hasOpening = messages.some(
    (m) => m.role === 'assistant' && m.content !== ''
  )

  if (!hasOpening) {
    const history = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const lastSnapshot = [...messages].reverse().find((m) => m.snapshot)
      ?.snapshot as GameSnapshot | null

    // Abilities active at the character's current tier. Resolved here rather
    // than inside generateOpening so the registry lookup stays in one place.
    const classDef = getWorld(character.world).classes.find(
      (c) => c.value === character.characterClass
    )
    const abilities = classDef
      ? resolveAbilities(classDef.abilities, lastSnapshot?.tier ?? 1)
      : []

    await generateOpening({
      sessionId,
      genre: campaign.genre,
      language: campaign.language,
      characterName: character.name,
      // Resolved label, never the raw slug: 'last_breath_priest' would
      // otherwise reach the model as narrative material.
      characterClass: classDef?.label ?? character.characterClass,
      characterRace: character.race,
      gender: character.gender,
      abilities,
      history,
      lastSnapshot,
    })
  }

  // Refetch messages after potential opening generation
  const freshData = await getSession(sessionId)
  if (!freshData) notFound()

  return (
    <GameScreen
      sessionId={sessionId}
      campaignId={id}
      initialMessages={freshData.messages}
      campaign={freshData.campaign}
      character={freshData.character}
    />
  )
}
