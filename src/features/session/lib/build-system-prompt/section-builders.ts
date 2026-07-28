// src/features/game/lib/build-system-prompt/section-builders.ts
// Pure functions that format lore data into prompt sections.
// No database calls — takes raw data, returns strings.

import type { PlayerContext } from './'
import { loreAppliesTo } from './lore-filter'
import {
  getAttributeDescription,
  getAttributeLabel,
  getClassLabel,
  getRaceLabel,
} from '@/worlds'

// ── Location block ─────────────────────────────────────────────────────────

export function buildLocationBlock(
  location: {
    name: string
    nameTranslation: string | null
    promptContext: string
    currentEvents: string | null
    subLocations: Array<{
      name: string
      lore: Array<{
        tier: string
        applicableRaces: string[] | null
        applicableClasses: string[] | null
        content: string
      }>
    }>
  },
  player: PlayerContext,
  secretLore: string[] // mutated in place — secrets collected here
): string {
  let block = `## CURRENT LOCATION
**${location.name}**${location.nameTranslation ? ` (${location.nameTranslation})` : ''}
${location.promptContext}`

  if (location.currentEvents) {
    block += `\n\nCURRENT EVENTS: ${location.currentEvents}`
  }

  for (const sub of location.subLocations) {
    for (const lore of sub.lore) {
      if (lore.tier === 'tier_secret') {
        secretLore.push(`[SECRET — ${sub.name}]: ${lore.content}`)
      } else if (loreAppliesTo(lore, player)) {
        block += `\n\n[${lore.tier.toUpperCase()} — ${sub.name}]: ${lore.content}`
      }
    }
  }

  return block
}

// ── NPC block ──────────────────────────────────────────────────────────────

export function buildNpcBlock(
  npcs: Array<{
    name: string
    title: string | null
    promptContext: string
    secret: string | null
    lore: Array<{
      tier: string
      applicableRaces: string[] | null
      applicableClasses: string[] | null
      content: string
    }>
  }>,
  player: PlayerContext,
  secretLore: string[] // mutated in place
): string {
  if (npcs.length === 0) return ''

  const sections = npcs.map((npc) => {
    let block = `### ${npc.name}${npc.title ? ` — ${npc.title}` : ''}
${npc.promptContext}`

    for (const lore of npc.lore) {
      if (lore.tier === 'tier_secret') {
        if (npc.secret) {
          secretLore.push(`[SECRET — ${npc.name}]: ${npc.secret}`)
        }
        secretLore.push(`[SECRET — ${npc.name} tier]: ${lore.content}`)
      } else if (loreAppliesTo(lore, player)) {
        block += `\n[${lore.tier.toUpperCase()}]: ${lore.content}`
      }
    }

    return block
  })

  return `## ACTIVE CHARACTERS\n${sections.join('\n\n')}`
}

// ── Secret block ───────────────────────────────────────────────────────────

export function buildSecretBlock(
  secretLore: string[],
  droppedHints: string[]
): string {
  if (secretLore.length === 0) return ''

  return `## AI KNOWLEDGE — NEVER STATE DIRECTLY
Reveal only through: environmental detail, NPC behaviour, found documents,
consequences of player actions. Never state directly in narration.

Previously hinted (do not repeat): ${
    droppedHints.length > 0 ? droppedHints.join(', ') : 'none'
  }

${secretLore.join('\n\n')}`
}

// ── Player block ───────────────────────────────────────────────────────────

// Grammatical gender for gendered languages (Polish etc.). Only an explicitly
// female character takes feminine forms; male, genderless, other, and unset
// (null) all fall back to masculine — matching the rule that non-binary /
// genderless beings (e.g. a demigod) use masculine grammar.

const FEMININE_GENDERS = new Set(['female', 'woman', 'f'])

export function genderToGrammar(
  gender: string | null
): 'feminine' | 'masculine' {
  if (gender && FEMININE_GENDERS.has(gender.trim().toLowerCase())) {
    return 'feminine'
  }
  return 'masculine'
}

/**
 * The stats the GM resolves uncertain actions against. Empty unless the caller
 * supplied attributes — the opening variant deliberately omits them, so this
 * returns '' and the player block renders exactly as before.
 *
 * Labels and descriptions resolve through the world registry: 'strength' is
 * Brawn in The Drift, Body in Neon Warszawa, and the description tells the
 * model what each one governs, so the resolution rules can stay world-agnostic
 * and let the model map action → attribute itself. Numbers carry no meaning
 * without a scale, so the header anchors one: 1 crippling, ~10 ordinary, 20 the
 * world's ceiling (ATTRIBUTE_HARD_MAX).
 */
function buildStatsBlock(player: PlayerContext): string {
  if (!player.attributes) return ''

  const lines = Object.entries(player.attributes).map(([attr, value]) => {
    const label = getAttributeLabel(player.world, attr)
    const desc = getAttributeDescription(player.world, attr)
    const keyMark = attr === player.keyAttribute ? ' [defining attribute]' : ''
    return `- ${label} — ${value}${keyMark}${desc ? `: ${desc}` : ''}`
  })

  return `## CHARACTER STATS
${player.characterName}'s attributes, on a scale where 1 is a crippling weakness, about 10 is an ordinary person, and 20 is the peak this world allows. When an action's outcome is genuinely uncertain, weigh the attribute that governs it — read each description to judge which one an action falls under. A high score makes success the likely result; a low score makes a setback likely.

${lines.join('\n')}`
}

export function buildPlayerBlock(player: PlayerContext): string {
  const grammar = genderToGrammar(player.gender)

  // Labels, not slugs. `duskborn` mid-sentence reads as a common noun and the
  // model translates it ("duskurodzony"); `Duskborn` reads as a name and
  // survives. Raw slugs must not reach the prompt — it is a display surface.
  const race = getRaceLabel(player.world, player.race)
  const characterClass = getClassLabel(player.world, player.characterClass)

  const base = `## PLAYER CHARACTER
Name: ${player.characterName}
Race: ${race}
Class: ${characterClass}
Grammatical gender: ${grammar} — in gendered languages, every verb, adjective and participle referring to ${player.characterName} must take ${grammar} forms.

Tier access rules:
- Reveal tier_1 lore relevant to the ${race} race.
- Reveal tier_2 lore relevant to the ${characterClass} class.
- Judge tier_3 access case by case from what the player does in the session.
- Never reveal tier_secret content directly.`

  const stats = buildStatsBlock(player)
  return stats ? `${base}\n\n${stats}` : base
}
