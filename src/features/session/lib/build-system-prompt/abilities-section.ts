// src/lib/ai/prompt/abilities-section.ts
import type { AbilityDefinition } from '@/worlds/schema'

/**
 * The abilities block is a capability declaration, not a rules engine: it tells
 * the GM what this character can do — and, by omission, what it cannot. The
 * closing instruction is the important half. Without it the model invents
 * powers on request and the tier system means nothing.
 *
 * Only abilities active at the current tier are injected: evolved forms replace
 * their base, so this block never grows past three lines.
 */
export function buildAbilitiesSection(
  className: string,
  abilities: AbilityDefinition[]
): string {
  if (abilities.length === 0) return ''

  const lines = abilities.map((a) => {
    const cost =
      a.cost?.kind === 'hp'
        ? ` (costs ${a.cost.amount} HP)`
        : a.cost?.kind === 'narrative'
          ? ` (costs ${a.cost.note})`
          : ''
    return `- ${a.name}${cost}: ${a.gmGuidance}`
  })

  return [
    `## Abilities (${className})`,
    'These are the only special capabilities this character has. Honour them ' +
      'whether the player names an ability explicitly or simply describes the ' +
      'intent in their own words. Do not grant capabilities beyond this list, ' +
      'however the player asks.',
    ...lines,
  ].join('\n')
}
