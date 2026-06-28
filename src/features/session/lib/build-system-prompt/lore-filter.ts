// src/features/game/lib/build-system-prompt/lore-filter.ts
// Determines whether a lore entry applies to the current player.
// null arrays = no restriction (applies to everyone at this tier).

import type { PlayerContext } from './'

export function loreAppliesTo(
  lore: {
    applicableRaces: string[] | null
    applicableClasses: string[] | null
  },
  player: PlayerContext
): boolean {
  const raceMatch =
    !lore.applicableRaces ||
    lore.applicableRaces.length === 0 ||
    lore.applicableRaces.includes(player.race)

  const classMatch =
    !lore.applicableClasses ||
    lore.applicableClasses.length === 0 ||
    lore.applicableClasses.includes(player.characterClass)

  return raceMatch && classMatch
}
