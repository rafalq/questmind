import { Avatar, type AvatarProps } from '@/components/ui/avatar'
import {
  pooledUrl,
  resolveBasePortrait,
} from '@/features/character/lib/avatar-pool'
import type { ReactNode } from 'react'

// Character-aware avatar. Preference order:
//   1. the player's chosen `avatarUrl` (from the wizard),
//   2. a deterministic pooled face from `characterId` (legacy characters),
//   3. the base race/sex portrait.
// Falls back to `fallbackIcon` if the image fails to load (handled by <Avatar>).

interface CharacterAvatarProps extends Pick<
  AvatarProps,
  'size' | 'shape' | 'className'
> {
  world: string
  race: string
  gender?: string | null
  /** Character or speaker name — used as alt text. */
  name: string
  /** The player's chosen portrait. Preferred over everything else. */
  avatarUrl?: string | null
  /** Optional class-derived icon shown when the portrait is missing. */
  fallbackIcon?: ReactNode
  /** Stable id to pick a pooled face when no avatarUrl is stored. */
  characterId?: string | null
  /** Pool size for the deterministic fallback (1 = no pool). */
  poolSize?: number
}

export function CharacterAvatar({
  world,
  race,
  gender,
  name,
  avatarUrl,
  fallbackIcon,
  characterId,
  poolSize = 1,
  ...rest
}: CharacterAvatarProps) {
  const src =
    avatarUrl ??
    pickPooledPortrait(
      resolveBasePortrait(world, race, gender),
      poolSize,
      characterId
    )

  return <Avatar src={src} alt={name} fallback={fallbackIcon} {...rest} />
}

// Deterministic pooled face from a stable seed. Same id => same face.
function pickPooledPortrait(
  base: string | undefined,
  poolSize: number,
  seed?: string | null
): string | undefined {
  if (!base || poolSize <= 1 || !seed) return base
  const index = 1 + (hashString(seed) % poolSize) // 1..poolSize
  return pooledUrl(base, index)
}

// Small stable string hash (djb2).
function hashString(value: string): number {
  let h = 5381
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) + h + value.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export default CharacterAvatar
