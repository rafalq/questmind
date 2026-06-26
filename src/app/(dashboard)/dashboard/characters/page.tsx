import { ROUTES } from '@/constants/routes'
import { getCharacters } from '@/features/character/queries/get-characters'
import Link from 'next/link'
import { Suspense } from 'react'

async function CharacterList() {
  const characters = await getCharacters()

  if (characters.length === 0) {
    return (
      <div className="text-center py-24 text-text-muted border border-border">
        <p className="text-lg">No characters yet.</p>
        <p className="text-sm mt-2">
          Create your first character to begin your journey.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => (
        <div
          key={character.id}
          className="border border-border p-5 flex flex-col gap-2 hover:border-accent transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted uppercase tracking-widest">
              {character.genre}
            </span>
            <span
              className={`text-xs px-2 py-0.5 border ${
                character.isAlive
                  ? 'border-accent text-accent'
                  : 'border-red-700 text-red-700'
              }`}
            >
              {character.isAlive ? 'Alive' : 'Dead'}
            </span>
          </div>
          <h3 className="text-text-primary font-semibold text-lg">
            {character.name}
          </h3>
          <p className="text-text-secondary text-sm capitalize">
            {character.race} · {character.characterClass.replace('_', ' ')}
          </p>
          <p className="text-text-muted text-xs mt-auto pt-2">
            Level {character.level} · {character.characterXp} XP
          </p>
        </div>
      ))}
    </div>
  )
}

export default function CharactersPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Your Characters
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your adventurers across all genres.
          </p>
        </div>
        <Link
          href={ROUTES.newCharacter}
          className="px-5 py-2 border border-accent text-accent hover:bg-accent hover:text-accent-fg transition-all text-sm tracking-wider"
        >
          + New Character
        </Link>
      </div>
      <Suspense
        fallback={<div className="text-text-muted">Loading characters...</div>}
      >
        <CharacterList />
      </Suspense>
    </div>
  )
}
