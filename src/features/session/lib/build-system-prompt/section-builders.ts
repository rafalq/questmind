// src/features/game/lib/build-system-prompt/section-builders.ts
// Pure functions that format lore data into prompt sections.
// No database calls — takes raw data, returns strings.

import type { PlayerContext } from './'
import { loreAppliesTo } from './lore-filter'

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

export function buildPlayerBlock(player: PlayerContext): string {
  return `## PLAYER CHARACTER
Name: ${player.characterName}
Race: ${player.race}
Class: ${player.characterClass}
Backstory: ${player.backstory}

Tier access rules:
- Reveal tier_1 lore relevant to the ${player.race} race.
- Reveal tier_2 lore relevant to the ${player.characterClass} class.
- Use the backstory above to judge tier_3 access case by case.
- Never reveal tier_secret content directly.`
}
