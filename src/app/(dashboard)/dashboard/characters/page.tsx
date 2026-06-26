import ButtonLink from '@/components/ui/button-link'
import { ROUTES } from '@/constants/routes'
import CharacterCard from '@/features/character/components/character-card'
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
        <CharacterCard key={character.id} character={character} />
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
        <ButtonLink href={ROUTES.newCharacter}>+ New Character</ButtonLink>
      </div>
      <Suspense
        fallback={<div className="text-text-muted">Loading characters...</div>}
      >
        <CharacterList />
      </Suspense>
    </div>
  )
}
