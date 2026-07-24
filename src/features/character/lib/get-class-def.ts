import { getWorld } from '@/worlds'

/**
 * The class definition for a character, or null when the stored slug no longer
 * matches anything in the world it belongs to.
 *
 * The lookup itself is one line, but it was written out in both game routes,
 * and a null result is not an edge case: `characterClass` is a plain text
 * column precisely so a new world can add classes without a migration, which
 * means the database can legitimately hold a slug this build does not know.
 * Callers have to handle null, and having one function to look at makes that
 * obligation visible.
 */
export function getClassDef(world: string, characterClass: string) {
  return (
    getWorld(world).classes.find((c) => c.value === characterClass) ?? null
  )
}
