import CharacterCard from '@/features/character/components/display/character-card'
import { getCharacters } from '@/features/character/queries/get-characters'

export default async function CharacterList() {
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
