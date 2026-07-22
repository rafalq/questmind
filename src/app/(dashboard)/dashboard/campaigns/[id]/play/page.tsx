import { getSession } from '@/features/session/queries/get-session'
import GameScreen from '@/features/session/components/game-screen'
import { notFound } from 'next/navigation'
import { getWorldLore } from '@/features/lore/queries/get-world-lore'

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

  const { campaign, character, messages, baseAttributes } = data

  // A real opening is an assistant message WITH narrative content. The
  // initial-snapshot message createSession seeds is role:'assistant' but
  // content:'' — it must not count as an opening.
  //
  // This page used to await generateOpening() right here. That call takes
  // several seconds against the API, and because it happened before the first
  // byte was flushed, the browser stayed on the dashboard for its whole
  // duration: the player clicked Play and nothing moved. The opening is now
  // requested by the client from /api/game/opening and streamed into the chat,
  // so the session screen paints immediately and the prose arrives token by
  // token — the same experience as every other turn.
  //
  // The flag is only a hint. The route re-checks the database before spending
  // anything, so a stale or duplicated request costs one query, not one call.
  const needsOpening = !messages.some(
    (m) => m.role === 'assistant' && m.content !== ''
  )

  const lore = await getWorldLore(campaign.genre)

  return (
    <GameScreen
      sessionId={sessionId}
      campaignId={id}
      initialMessages={messages}
      campaign={campaign}
      character={character}
      baseAttributes={baseAttributes}
      needsOpening={needsOpening}
      lore={lore}
    />
  )
}
