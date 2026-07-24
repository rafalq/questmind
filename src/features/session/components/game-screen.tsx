'use client'

import {
  type campaignsTable,
  type charactersTable,
  type messagesTable,
} from '@/db/schema'
import type { NpcPortrait } from '@/features/lore/queries/get-npc-portraits'
import { type WorldLore } from '@/features/lore/queries/get-world-lore'
import type { Attribute } from '@/worlds/schema'
import { useRef } from 'react'
import { useGameSession } from '../hooks/use-game-session'
import { useSidePanel } from '../hooks/use-side-panel'
import ChatPanel, { type ChatPanelHandle } from './chat-panel'
import SessionHeader from './session-header'
import StatsPanel from './stats-panel'

type DbMessage = typeof messagesTable.$inferSelect
type Campaign = typeof campaignsTable.$inferSelect
type Character = typeof charactersTable.$inferSelect

type Props = {
  sessionId: string
  campaignId: string
  initialMessages: DbMessage[]
  campaign: Campaign
  character: Character
  // Base values from the DB: point-buy plus race/class/gender modifiers.
  // Per-level growth is applied on read, in the panel.
  baseAttributes: Record<Attribute, number>
  needsOpening: boolean
  lore: WorldLore | null
  /** Authored cast of this world, keyed by lower-cased name. Passed straight
   *  through to the chat, which resolves it against each turn's `npcMet`. */
  npcPortraits: Record<string, NpcPortrait>
}

/**
 * The session screen: chat on the left, stats on the right.
 *
 * This component is the layout and nothing else. The turn loop lives in
 * useGameSession and the drawer geometry in useSidePanel, because neither has
 * anything to do with the other and both were previously interleaved here.
 */
export default function GameScreen({
  sessionId,
  initialMessages,
  campaign,
  character,
  baseAttributes,
  needsOpening,
  lore,
  npcPortraits,
}: Props) {
  const { messages, snapshot, isStreaming, sendMessage } = useGameSession({
    sessionId,
    initialMessages,
    needsOpening,
  })

  const panel = useSidePanel()

  // Clicking an ability seeds the composer. Imperative, not state: this is an
  // event, and lifting the input's state would re-render the chat on every
  // keystroke from up here.
  const chatRef = useRef<ChatPanelHandle>(null)

  const handleUseAbility = (name: string) => {
    chatRef.current?.insertAbility(name)
    // On mobile the panel is an overlay sitting on top of the composer, so it
    // has to get out of the way once it has done its job.
    if (!panel.isDesktop()) panel.close()
  }

  return (
    // min-h-0 + flex-1 rather than h-screen: this sits inside the root
    // layout's <main class="flex flex-1 flex-col">, so h-screen would stack a
    // full viewport under the navbar and push the composer off-screen. It also
    // avoids the mobile-Safari address-bar problem that plagues 100vh.
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-bg-base">
      {/* Left: chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        <SessionHeader
          campaignName={campaign.name}
          genre={campaign.genre}
          lore={lore}
          isPanelOpen={panel.isOpen}
          onTogglePanel={panel.toggle}
        />
        <ChatPanel
          ref={chatRef}
          messages={messages}
          isStreaming={isStreaming}
          onSend={sendMessage}
          genre={campaign.genre}
          characterName={character.name}
          npcPortraits={npcPortraits}
        />
      </div>

      {/* Backdrop - drawer mode only, and only once the player has opened the
          panel by hand. Tapping outside closes it, the gesture an overlay
          implies. lg:hidden because above that the panel is a column, not an
          overlay, and dimming the chat behind it would make no sense. */}
      {panel.isOpen === true && (
        <div
          className="absolute inset-0 z-30 bg-black/50 lg:hidden"
          onClick={panel.close}
          aria-hidden
        />
      )}

      {/* Right: stats. Overlay drawer below lg, in-flow column at lg and up.
          Width is animated only on desktop; the drawer slides instead, so the
          content never reflows mid-transition. */}
      <aside
        className={`absolute inset-y-0 right-0 z-40 w-[85vw] max-w-xs overflow-y-auto border-l border-border bg-bg-surface transition-transform duration-300 lg:static lg:z-auto lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-[width] ${panel.panelClass}`}
      >
        <StatsPanel
          snapshot={snapshot}
          character={character}
          baseAttributes={baseAttributes}
          onUseAbility={handleUseAbility}
        />
      </aside>
    </div>
  )
}
