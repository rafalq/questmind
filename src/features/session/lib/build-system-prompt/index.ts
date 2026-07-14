// src/features/game/lib/build-system-prompt/index.ts
// Main entry point — composes lore sections into the final system prompt.
import { buildLanguageSection } from './language-section'
import { getWorld } from '@/worlds'
import { resolveAbilities } from '@/features/character/lib/progression'
import { buildAbilitiesSection } from '@/features/session/lib/build-system-prompt/abilities-section'

export interface PlayerContext {
  campaignId: string
  characterName: string
  race: string
  characterClass: string
  gender: string | null
  // backstory removed — free-text player input dropped from the wizard;
  // it added no world-consistent signal to tier access.
  // backstory: string
  world: string
  tier: 1 | 2 | 3
}

export interface BuildPromptOptions {
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  player: PlayerContext
  language: string
  sessionSummary?: string
}

// Shape returned by lore-resolver — all optional since a session
// might start before a location is set.
export interface ResolvedLore {
  worldCore: string
  locationBlock: string
  knownLocationsBlock: string
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

  // Abilities are injected per tier: evolved forms replace their base, so this
  // block never grows past three lines. Empty for classes not yet seeded —
  // .filter(Boolean) below drops it.
  const classDef = getWorld(player.world).classes.find(
    (c) => c.value === player.characterClass
  )
  const abilitiesBlock = classDef
    ? buildAbilitiesSection(
        classDef.label,
        resolveAbilities(classDef.abilities, player.tier)
      )
    : ''

  const languageBlock = buildLanguageSection(language)
  const continuityBlock = sessionSummary
    ? `## SESSION HISTORY\n${sessionSummary}`
    : ''

  return [
    lore.worldCore,
    lore.locationBlock,
    lore.knownLocationsBlock,
    lore.npcBlock,
    lore.eventsBlock,
    playerBlock,
    abilitiesBlock,
    secretBlock,
    continuityBlock,
    languageBlock,
    GAME_MASTER_INSTRUCTIONS,
  ]
    .filter(Boolean)
    .join('\n\n---\n\n')
}
