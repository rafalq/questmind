// src/features/game/lib/build-system-prompt/index.ts
// Main entry point — composes lore sections into the final system prompt.
import { buildAbilitiesSection } from '@/features/session/lib/build-system-prompt/abilities-section'
import { AbilityDefinition, Genre, getWorld } from '@/worlds'
import { buildLanguageSection } from './language-section'

export interface PlayerContext {
  campaignId: string
  characterName: string
  race: string
  characterClass: string
  gender: string | null
  world: string
  abilities: AbilityDefinition[]
}

export interface BuildPromptOptions {
  genre: Genre
  player: PlayerContext
  language: string
  sessionSummary?: string
}

export interface BuiltPrompt {
  prompt: string
  /** Scene tags this campaign's world allows, including the universal ones. */
  validSceneTags: Set<string>
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
  sceneTags: string[]
}

export { SEPARATOR } from './game-master-instructions'

import { genreSceneTags } from '@/worlds/schema/scenes'
import { buildGameMasterInstructions } from './game-master-instructions'
import { resolveLore } from './lore-resolver'
import { buildPlayerBlock, buildSecretBlock } from './section-builders'

export async function buildSystemPrompt(
  options: BuildPromptOptions
): Promise<BuiltPrompt> {
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
  const abilitiesBlock =
    classDef && player.abilities.length
      ? buildAbilitiesSection(classDef.label, player.abilities)
      : ''

  const languageBlock = buildLanguageSection(language)
  const continuityBlock = sessionSummary
    ? `## SESSION HISTORY\n${sessionSummary}`
    : ''

  const validSceneTags = new Set([
    ...lore.sceneTags,
    ...genreSceneTags(options.genre),
  ])

  const prompt = [
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
    buildGameMasterInstructions([...validSceneTags]),
  ]
    .filter(Boolean)
    .join('\n\n---\n\n')

  return {
    prompt,
    validSceneTags,
  }
}
