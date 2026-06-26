import { genreIcon, genreFont, genreBg } from '@/lib/genre-config'
import type { Genre } from '@/features/character/constants'
import type { FormData } from '../types/wizard-types'

const GENRE_DESCRIPTIONS: Record<Genre, string> = {
  fantasy: 'Swords, sorcery, and ancient prophecy in the realm of Erevan.',
  'sci-fi': 'Space exploration and survival aboard the stations of The Drift.',
  cyberpunk: 'Chrome and neon. Fight for survival in Neon Warszawa 2087.',
}

const GENRES: Genre[] = ['fantasy', 'sci-fi', 'cyberpunk']

export default function StepBasics({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm text-text-secondary mb-2 tracking-wider uppercase">
          Character Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Enter a name..."
          maxLength={60}
          className="w-full bg-transparent border border-border px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-3 tracking-wider uppercase">
          Genre
        </label>
        <div className="flex flex-col gap-3">
          {GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() =>
                onChange({ genre, race: null, characterClass: null })
              }
              className={`text-left border px-5 py-4 transition-colors ${
                data.genre === genre
                  ? 'border-accent'
                  : 'border-border hover:border-text-muted'
              }`}
              style={
                data.genre === genre
                  ? { backgroundColor: genreBg[genre] }
                  : undefined
              }
            >
              <div
                className="flex items-center gap-2 mb-1"
                style={
                  data.genre === genre
                    ? { fontFamily: genreFont[genre] }
                    : undefined
                }
              >
                <span
                  className={
                    data.genre === genre ? 'text-accent' : 'text-text-muted'
                  }
                >
                  {genreIcon[genre]}
                </span>
                <p
                  className={`font-semibold capitalize ${data.genre === genre ? 'text-accent' : 'text-text-primary'}`}
                >
                  {genre}
                </p>
              </div>
              <p className="text-text-muted text-sm">
                {GENRE_DESCRIPTIONS[genre]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
