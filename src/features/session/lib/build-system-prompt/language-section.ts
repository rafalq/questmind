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
 *
 * Rule 2 only applies where a state block exists. The opening message is prose
 * only and deliberately ships without the output contract, so mentioning the
 * separator there tells the model that a machine-readable block is expected
 * while leaving it no shape to follow — and it invents one. That is exactly
 * what happened: an opening closed with a separator and a JSON object of the
 * model's own design (`session`, `playerCharacter`, `active_npcs`), which was
 * then saved verbatim and shown to the player. Hence the variant.
 */
export function buildLanguageSection(
  languageCode: string,
  variant: 'turn' | 'opening' = 'turn'
): string {
  const { promptName } = getLanguage(languageCode)

  // English needs no instruction — it's the model's default and the JSON
  // is English anyway. Skip the section to save tokens.
  if (languageCode === 'en') return ''

  const lines = [
    `## Language`,
    `Narrate entirely in ${promptName}. All narration, dialogue, descriptions`,
    `and character speech must be in ${promptName}.`,
  ]

  if (variant === 'turn') {
    lines.push(
      ``,
      `Critical exception: everything after the "${SEPARATOR}" separator is a`,
      `machine-readable game-state block. Keep it in English exactly as`,
      `specified — English JSON keys and English enum values. Do not translate,`,
      `annotate or reformat it. Narrative language never leaks past the separator.`
    )
  }

  return lines.join('\n')
}
