import { ENABLED_WORLDS } from './index'
import type { Genre } from './schema'

/**
 * Resolves a genre to its starting-location slug via the world registry.
 *
 * Current model: one enabled world per genre, so genre→world is unambiguous.
 * If a second enabled world of the same genre is ever added, this throws
 * loudly rather than silently picking one — a deliberate tripwire. The real
 * fix then is to move `world` onto the campaign (see docs/future/data-model.md).
 */
export function getStartingLocationByGenre(genre: Genre): string {
  const matches = ENABLED_WORLDS.filter((w) => w.genre === genre)

  if (matches.length > 1) {
    throw new Error(
      `Ambiguous genre "${genre}": ${matches.length} enabled worlds. ` +
        `Campaign must reference a world, not a genre.`
    )
  }

  const world = matches[0]
  if (!world) {
    throw new Error(`No enabled world registered for genre: "${genre}"`)
  }
  if (!world.startingLocation) {
    throw new Error(
      `World "${world.value}" has no startingLocation — required for RAG.`
    )
  }

  return world.startingLocation // now narrowed to string
}
