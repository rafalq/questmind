import { getWorld } from '@/worlds'

// Shared helpers for the pooled-avatar files. Single source of truth for the
// picker and CharacterAvatar.
//
// Base race portraits (full silhouettes) live wherever the world definition
// points, e.g.  /images/fantasy/treigthe/characters/races/scarred-male.jpg
// The bust-crop avatars live in an `avatars/` subfolder of that same directory,
// saved as .webp:      .../races/avatars/scarred-male-01.webp
// The single per-world default is one shared file in that folder:
//                      .../races/avatars/_default.webp
const AVATAR_SUBDIR = 'avatars/'
const AVATAR_EXT = 'webp' // pooled avatars are .webp regardless of the base ext
const WORLD_DEFAULT_FILE = `_default.${AVATAR_EXT}` // one shared default per world

export function resolveBasePortrait(
  world: string,
  race: string,
  gender?: string | null
): string | undefined {
  const def = getWorld(world).races.find((r) => r.value === race)
  if (!def) return undefined
  if (def.genderless) return def.portraitUrl
  return gender === 'female' ? def.femalePortraitUrl : def.malePortraitUrl
}

function splitPath(url: string): { dir: string; stem: string } {
  const slash = url.lastIndexOf('/')
  const dir = slash === -1 ? '' : url.slice(0, slash + 1)
  const file = slash === -1 ? url : url.slice(slash + 1)
  const dot = file.lastIndexOf('.')
  const stem = dot === -1 ? file : file.slice(0, dot)
  return { dir, stem }
}

// "/x/races/scarred-male.jpg" -> "/x/races/avatars/scarred-male-03.webp"
export function pooledUrl(base: string, index: number): string {
  const { dir, stem } = splitPath(base)
  const nn = String(index).padStart(2, '0')
  return `${dir}${AVATAR_SUBDIR}${stem}-${nn}.${AVATAR_EXT}`
}

export function buildAvatarPool(
  world: string,
  race: string,
  gender?: string | null,
  count = 4
): string[] {
  const base = resolveBasePortrait(world, race, gender)
  if (!base) return []
  return Array.from({ length: count }, (_, i) => pooledUrl(base, i + 1))
}

// One default portrait per world. Derives the world's portrait directory from
// any race's base URL (it contains the world slug), then points at the shared
// _default file. "/x/treigthe/.../races/scarred-male.jpg"
//   -> "/x/treigthe/.../races/avatars/_default.webp"
export function defaultAvatarUrl(
  world: string,
  race: string,
  gender?: string | null
): string | undefined {
  const base = resolveBasePortrait(world, race, gender)
  if (!base) return undefined
  const { dir } = splitPath(base)
  return `${dir}${AVATAR_SUBDIR}${WORLD_DEFAULT_FILE}`
}
