import type { Race, CharacterClass } from '@/features/character/constants'

// Key format: "{race}:{gender-or-none}:{class}"
export type PortraitKey = `${Race}:${string}:${CharacterClass}`

export const CHARACTER_PORTRAITS: Partial<Record<PortraitKey, string>> = {
  // Add as generated, e.g.:
  // 'duskborn:female:bleeder': '/portraits/duskborn-female-bleeder.jpg',
}
