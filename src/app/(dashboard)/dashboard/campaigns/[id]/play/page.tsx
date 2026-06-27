import { getSession } from '@/features/session/queries/get-session'
import GameScreen from '@/features/session/components/game-screen'
import { notFound } from 'next/navigation'

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

  return (
    <GameScreen
      sessionId={sessionId}
      campaignId={id}
      initialMessages={data.messages}
      campaign={data.campaign}
      character={data.character}
    />
  )
}
