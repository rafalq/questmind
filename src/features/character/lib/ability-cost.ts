import type { AbilityDefinition } from '@/worlds/schema'

type AbilityCost = NonNullable<AbilityDefinition['cost']>

/**
 * The player-facing price of an ability, or null when it has none.
 *
 * Five places asked `cost?.kind === 'hp'` directly: the stats panel, the
 * character sheet, the class card, the summary step and the prompt builder.
 * Only the prompt builder handled the other kind. An ability with a narrative
 * cost therefore told the model to charge for it and showed the player
 * nothing - in a world whose whole premise is that power is paid for, the one
 * detail worth surfacing was the one being dropped.
 *
 * A discriminated union with one arm handled in four places and both arms in a
 * fifth is what this function exists to prevent: adding a third kind is now a
 * change here, and every caller follows.
 */
export function formatAbilityCost(cost: AbilityCost | undefined): string | null {
  if (!cost) return null

  // 'hp' is mechanical - the GM must reflect it in the snapshot, so it is a
  // number the player can check. 'narrative' is a price the GM invents and
  // enforces in prose, so its note is already written for the player.
  return cost.kind === 'hp' ? `${cost.amount} HP` : cost.note
}

/** The same price as a parenthetical, for the system prompt. */
export function describeAbilityCost(cost: AbilityCost | undefined): string {
  const label = formatAbilityCost(cost)
  return label ? ` (costs ${label})` : ''
}
