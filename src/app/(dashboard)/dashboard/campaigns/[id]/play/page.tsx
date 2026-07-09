import { getSession } from '@/features/session/queries/get-session'
import { generateOpening } from '@/features/session/lib/generate-opening'
import GameScreen from '@/features/session/components/game-screen'
import { notFound } from 'next/navigation'
import { type GameSnapshot } from '@/db/schema/session'

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

    await generateOpening({
      sessionId,
      genre: campaign.genre,
      language: campaign.language,
      campaignName: campaign.name,
      characterName: character.name,
      characterClass: character.characterClass,
      characterRace: character.race,
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
