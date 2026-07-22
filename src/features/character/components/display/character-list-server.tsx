import CharacterListClient from '@/features/character/components/display/character-list-client'
import { getCharacters } from '@/features/character/queries/get-characters'

export default async function CharacterListServer() {
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

  return <CharacterListClient characters={characters} />
}
