// features/character/constants/worlds.ts
// World-level metadata for the character creation wizard (StepWorld card display)
// and the world → genre mapping used at submit time.

import type { Genre } from './shared'

export type WorldDefinition = {
  value: World
  genre: Genre
  name: string // "Tréigthe"
  subtitle: string // "The Forsaken"
  description: string // shown on the world selection card
}

export type World = 'treigthe' // extend: | 'drift' | 'neon-warsaw

export const WORLDS: WorldDefinition[] = [
  {
    value: 'treigthe',
    genre: 'fantasy',
    name: 'Tréigthe',
    subtitle: 'The Forsaken',
    description:
      'A dark Celtic-Slavic realm where the gods died centuries ago, their corpses rotting in the heavens. Magic is real, but nothing is free — every spell costs blood, years, or memory.',
  },
  // Add here as new worlds are migrated:
  // { value: 'drift', genre: 'sci-fi', name: 'The Drift', subtitle: 'The Unmoored', description: '...' },
  // { value: 'neon_warszawa', genre: 'cyberpunk', name: 'Neon Warszawa', subtitle: '2087', description: '...' },
]

// Derived lookup, used at submit time so `genre` doesn't need to be
// separately selected or stored in wizard state.
export const GENRE_BY_WORLD: Record<World, Genre> = WORLDS.reduce(
  (acc, w) => ({ ...acc, [w.value]: w.genre }),
  {} as Record<World, Genre>
)
