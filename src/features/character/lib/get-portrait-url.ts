import { CharacterClass, Race } from '../constants'
import { CHARACTER_PORTRAITS, PortraitKey } from '../constants/constants'

export function getPortraitUrl(
  race: Race,
  gender: string | null,
  characterClass: CharacterClass
): string | undefined {
  const key = `${race}:${gender ?? 'none'}:${characterClass}` as PortraitKey
  return CHARACTER_PORTRAITS[key]
}
