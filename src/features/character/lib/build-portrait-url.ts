// Builds the portrait path from race/gender/class using a fixed naming
// convention. No registry to maintain — drop the file at the resulting
// path in public/, and it just works. Missing files fall back to
// ClassIconBadge, handled client-side via <Image onError>.

import type { Race, CharacterClass } from '@/features/character/constants'
import { TREIGTHE_CLASS_PORTAITS_BASE_URL } from '@/features/character/constants/fantasy/treigthe'

// Naming convention: {race}-{gender}-{class}.jpg
// Gender segment is omitted entirely for genderless races (e.g. demigod).
export function buildPortraitUrl(
  race: Race,
  gender: string | null,
  characterClass: CharacterClass,
  basePath: string = TREIGTHE_CLASS_PORTAITS_BASE_URL
): string {
  const segments = gender
    ? [race, gender, characterClass]
    : [race, characterClass]
  return `${basePath}${segments.join('-')}.jpg`
}
