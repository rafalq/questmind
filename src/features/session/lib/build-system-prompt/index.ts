// src/features/game/lib/build-system-prompt/index.ts
// Main entry point — composes lore sections into the final system prompt.
import { buildLanguageSection } from './language-section'

export interface PlayerContext {
  campaignId: string
  characterName: string
  race: string
  characterClass: string
  // backstory removed — free-text player input dropped from the wizard;
  // it added no world-consistent signal to tier access.
  // backstory: string
}

export interface BuildPromptOptions {
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  player: PlayerContext
  language: string
  sessionSummary?: string // from tiktoken summarisation (FR-006)
}

// Shape returned by lore-resolver — all optional since a session
// might start before a location is set.
export interface ResolvedLore {
  worldCore: string
  locationBlock: string
  npcBlock: string
  eventsBlock: string
  secretLore: string[]
  droppedSecretHints: string[]
}

export { SEPARATOR } from './game-master-instructions'

import { resolveLore } from './lore-resolver'
import { buildSecretBlock, buildPlayerBlock } from './section-builders'
import { GAME_MASTER_INSTRUCTIONS } from './game-master-instructions'

export async function buildSystemPrompt(
  options: BuildPromptOptions
): Promise<string> {
  const { player, sessionSummary, language } = options
  const lore = await resolveLore(options)
  const secretBlock = buildSecretBlock(lore.secretLore, lore.droppedSecretHints)
  const playerBlock = buildPlayerBlock(player)
  const languageBlock = buildLanguageSection(language)
  const continuityBlock = sessionSummary
    ? `## SESSION HISTORY\n${sessionSummary}`
    : ''

  return [
    lore.worldCore,
    lore.locationBlock,
    lore.npcBlock,
    lore.eventsBlock,
    playerBlock,
    secretBlock,
    continuityBlock,
    languageBlock,
    GAME_MASTER_INSTRUCTIONS,
  ]
    .filter(Boolean)
    .join('\n\n---\n\n')
}
