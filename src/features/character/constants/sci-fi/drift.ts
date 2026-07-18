// features/character/constants/sci-fi/drift.ts
//
// Per-world presentation for The Drift. Definitions (races, classes,
// abilities) live in src/worlds/drift/definition.ts — icons intentionally
// stay out of world definitions so those remain pure serializable data
// (same split as TREIGTHE_CLASS_ICONS).

import {
  IconAxe,
  IconBolt,
  IconBroadcastOff,
  IconGhost,
} from '@tabler/icons-react'
import type { DriftClass } from '@/worlds/drift/definition'

export const DRIFT_CLASS_ICONS: Record<DriftClass, typeof IconAxe> = {
  breaker: IconAxe,
  conduit: IconBolt,
  voidrunner: IconGhost,
  silence_cantor: IconBroadcastOff,
}
