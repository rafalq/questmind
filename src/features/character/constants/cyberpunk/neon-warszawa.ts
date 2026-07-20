// features/character/constants/cyberpunk/neon-warszawa.ts
//
// Per-world presentation for Neon Warszawa 2087. Definitions (races,
// classes, abilities) live in src/worlds/neon-warszawa/definition.ts —
// icons intentionally stay out of world definitions so those remain pure
// serializable data (same split as TREIGTHE_CLASS_ICONS).

import {
  IconCpu,
  IconEyeOff,
  IconMusicOff,
  IconSword,
} from '@tabler/icons-react'
import type { NeonWarszawaClass } from '@/worlds/neon-warszawa/definition'

export const NEON_WARSZAWA_CLASS_ICONS: Record<
  NeonWarszawaClass,
  typeof IconSword
> = {
  enforcer: IconSword,
  diver: IconCpu,
  shadow: IconEyeOff,
  cantor: IconMusicOff,
}
