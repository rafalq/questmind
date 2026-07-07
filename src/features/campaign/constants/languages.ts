/**
 * Supported narration languages for campaigns.
 *
 * code       — ISO 639-1, stored in campaigns.language and used as the dropdown value.
 * label      — native name shown in the dropdown.
 * promptName — English name injected into the system prompt ("Narrate in {promptName}").
 *
 * Font note: the themed narrative fonts (IM Fell English, Share Tech Mono)
 * ship only the `latin` glyph subset. Western-European languages render in
 * the themed font; Central-European, Cyrillic and Greek fall through to the
 * Noto fallback declared in the narrative font-family stack (globals.css).
 * Deliberate graceful degradation, not a bug.
 */
export const LANGUAGES = [
  // Western European — render in the themed fonts (latin subset)
  { code: 'en', label: 'English', promptName: 'English' },
  { code: 'de', label: 'Deutsch', promptName: 'German' },
  { code: 'fr', label: 'Français', promptName: 'French' },
  { code: 'es', label: 'Español', promptName: 'Spanish' },
  { code: 'it', label: 'Italiano', promptName: 'Italian' },
  { code: 'pt', label: 'Português', promptName: 'Portuguese' },
  { code: 'nl', label: 'Nederlands', promptName: 'Dutch' },

  // Central / Northern European — need latin-ext → Noto fallback
  { code: 'pl', label: 'Polski', promptName: 'Polish' },
  { code: 'cs', label: 'Čeština', promptName: 'Czech' },
  { code: 'sk', label: 'Slovenčina', promptName: 'Slovak' },
  { code: 'hu', label: 'Magyar', promptName: 'Hungarian' },
  { code: 'ro', label: 'Română', promptName: 'Romanian' },
  { code: 'hr', label: 'Hrvatski', promptName: 'Croatian' },
  { code: 'sl', label: 'Slovenščina', promptName: 'Slovenian' },
  { code: 'sv', label: 'Svenska', promptName: 'Swedish' },
  { code: 'da', label: 'Dansk', promptName: 'Danish' },
  { code: 'fi', label: 'Suomi', promptName: 'Finnish' },
  { code: 'no', label: 'Norsk', promptName: 'Norwegian' },
  { code: 'is', label: 'Íslenska', promptName: 'Icelandic' },
  { code: 'et', label: 'Eesti', promptName: 'Estonian' },
  { code: 'lv', label: 'Latviešu', promptName: 'Latvian' },
  { code: 'lt', label: 'Lietuvių', promptName: 'Lithuanian' },
  { code: 'ga', label: 'Gaeilge', promptName: 'Irish' },
  { code: 'mt', label: 'Malti', promptName: 'Maltese' },
  { code: 'sq', label: 'Shqip', promptName: 'Albanian' },

  // Cyrillic script — Noto fallback
  { code: 'ru', label: 'Русский', promptName: 'Russian' },
  { code: 'uk', label: 'Українська', promptName: 'Ukrainian' },
  { code: 'bg', label: 'Български', promptName: 'Bulgarian' },
  { code: 'sr', label: 'Српски', promptName: 'Serbian' },
  { code: 'mk', label: 'Македонски', promptName: 'Macedonian' },
  { code: 'be', label: 'Беларуская', promptName: 'Belarusian' },

  // Greek script — Noto fallback
  { code: 'el', label: 'Ελληνικά', promptName: 'Greek' },
] as const

export type Language = (typeof LANGUAGES)[number]
export type LanguageCode = Language['code']

/** Non-empty tuple for z.enum(...) in the create-campaign input schema. */
export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code) as [
  LanguageCode,
  ...LanguageCode[],
]

export const DEFAULT_LANGUAGE: LanguageCode = 'en'

/** Lookup helper — falls back to English for unknown/legacy codes. */
export function getLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
}
