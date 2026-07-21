import { type Genre } from './primitives'

type SceneMap = Record<string, string> & { default: string }

/**
 * tag → background image, per genre. This map is the source of truth for which
 * non-location tags a world allows: a tag with no image here is a tag the UI
 * could not render anyway, so there is no second list to keep in sync.
 *
 * Every genre must define `default` — it is the fallback when a tag is missing
 * or unknown, and Record<Genre, ...> plus this comment is the only thing
 * guarding that. Location-bound tags come from locationsTable.sceneTag.
 */
export const SCENE_IMAGES: Record<Genre, SceneMap> = {
  fantasy: {
    default: '/images/fantasy/treigthe/scenes/default.webp',
    city_square: '/images/fantasy/treigthe/scenes/city-square.webp',
    port: '/images/fantasy/treigthe/scenes/port.webp',
    tavern: '/images/fantasy/treigthe/scenes/tavern.webp',
    battle: '/images/fantasy/treigthe/scenes/battle.webp',
    camp_night: '/images/fantasy/treigthe/scenes/camp-night.webp',
    forest: '/images/fantasy/treigthe/scenes/forest.webp',
    bog: '/images/fantasy/treigthe/scenes/bog.webp',
    tomb_interior: '/images/fantasy/treigthe/scenes/tomb-interior.webp',
    city_gate: '/images/fantasy/treigthe/scenes/city-gate.webp',
    country_road: '/images/fantasy/treigthe/scenes/country-road.webp',
    ruins: '/images/fantasy/treigthe/scenes/ruins.webp',
  },
  'sci-fi': {
    default: '/images/sci-fi/drift/scenes/default.webp',
    command_deck: '/images/sci-fi/drift/scenes/command-deck.webp',
    derelict_wreck: '/images/sci-fi/drift/scenes/derelict-wreck.webp',
    docking_bay: '/images/sci-fi/drift/scenes/docking-bay.webp',
    station_corridor: '/images/sci-fi/drift/scenes/station-corridor.webp',
  },
  cyberpunk: {
    default: '/images/cyberpunk/neon-warszawa/scenes/default.webp',
    corporate_plaza:
      '/images/cyberpunk/neon-warszawa/scenes/corporate-plaza.webp',
    megablock_interior:
      '/images/cyberpunk/neon-warszawa/scenes/megablock-interior.webp',
    street_market: '/images/cyberpunk/neon-warszawa/scenes/street-market.webp',
  },
}

export function sceneImage(genre: Genre, tag: string | null): string {
  const world = SCENE_IMAGES[genre]
  return (tag && world[tag]) || world.default
}

export function genreSceneTags(genre: Genre): string[] {
  return Object.keys(SCENE_IMAGES[genre])
}
