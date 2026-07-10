import { getLanguage } from '@/features/campaign/constants/languages'
import { SEPARATOR } from './game-master-instructions'

/**
 * Builds the language instruction for the system prompt.
 *
 * Two rules the model must never break:
 *  1. Narrate in the campaign's chosen language.
 *  2. The game-state block after SEPARATOR stays English — keys AND values
 *     the client parses (hp, inventory, quests). Translating those breaks
 *     the delta parser in stream-game-response.ts.
 */
export function buildLanguageSection(languageCode: string): string {
  const { promptName } = getLanguage(languageCode)

  // English needs no instruction — it's the model's default and the JSON
  // is English anyway. Skip the section to save tokens.
  if (languageCode === 'en') return ''

  return [
    `## Language`,
    `Narrate entirely in ${promptName}. All narration, dialogue, descriptions`,
    `and character speech must be in ${promptName}.`,
    ``,
    `Critical exception: everything after the "${SEPARATOR}" separator is a`,
    `machine-readable game-state block. Keep it in English exactly as`,
    `specified — English JSON keys and English enum values. Do not translate,`,
    `annotate or reformat it. Narrative language never leaks past the separator.`,
  ].join('\n')
}
