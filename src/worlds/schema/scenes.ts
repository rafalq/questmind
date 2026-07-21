import { type Genre } from './primitives'

/**
 * Tags that belong to no single location: situations (battle, camp_night) and
 * interiors that live inside a location rather than beside it. Location-bound
 * tags are NOT listed here — they live on locationsTable.sceneTag, seeded per
 * world, and are read back by the lore resolver. One tag, one source.
 */
export const UNIVERSAL_SCENE_TAGS = ['default'] as const

/** tag → background image, per genre. Missing entries fall back to default. */
export const SCENE_IMAGES: Record<Genre, Record<string, string>> = {
  fantasy: {
    default: '/images/fantasy/treigthe/scenes/default.webp',
    city_square: '/images/fantasy/treigthe/scenes/city-square.webp',
    port: '/images/fantasy/treigthe/scenes/port.webp',
    tavern: '/images/fantasy/treigthe/scenes/tavern.webp',
    battle: '/images/fantasy/treigthe/scenes/battle.webp',
    camp_night: '/images/fantasy/treigthe/scenes/camp-night.webp',
  },
  'sci-fi': {
    default: '/images/sci-fi/drift/scenes/default.webp',
  },
  cyberpunk: {
    default: '/images/cyberpunk/neon-warszawa/scenes/default.webp',
  },
}

export function sceneImage(genre: Genre, tag: string | null): string {
  const world = SCENE_IMAGES[genre]
  return (tag && world[tag]) || world.default
}
