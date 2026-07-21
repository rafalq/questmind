// src/features/session/lib/build-system-prompt/index.ts
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
  /**
   * 'opening' omits the output contract: that message is prose only, with no
   * separator and no state block. It still gets the lore and the narration
   * rules, which is the whole point — the opening used to build its own prompt
   * from the genre alone and invented a city that exists nowhere in the seed.
   */
  variant?: 'turn' | 'opening'
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
import {
  NARRATIVE_RULES,
  buildGameMasterInstructions,
} from './game-master-instructions'
import { resolveLore } from './lore-resolver'
import { buildPlayerBlock, buildSecretBlock } from './section-builders'

export async function buildSystemPrompt(
  options: BuildPromptOptions
): Promise<BuiltPrompt> {
  const { player, sessionSummary, language, variant = 'turn' } = options
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

  const languageBlock = buildLanguageSection(language, variant)
  const continuityBlock = sessionSummary
    ? `## SESSION HISTORY\n${sessionSummary}`
    : ''

  // Location tags come from the seeded lore; the rest are whatever this genre
  // has artwork for. Both sides of the same set: the prompt tells the model
  // what it may say, and the caller validates the answer against it.
  const validSceneTags = new Set([
    ...lore.sceneTags,
    ...genreSceneTags(options.genre),
  ])

  const instructionsBlock =
    variant === 'opening'
      ? NARRATIVE_RULES
      : buildGameMasterInstructions([...validSceneTags])

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
    instructionsBlock,
  ]
    .filter(Boolean)
    .join('\n\n---\n\n')

  // Returned even for the opening variant: harmless there, and it keeps the
  // return shape the same for both callers.
  return {
    prompt,
    validSceneTags,
  }
}
