import GenreCard from '@/components/ui/genre-card'

type Character = {
  id: string
  name: string
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  race: string
  characterClass: string
  level: number
  characterXp: number
  isAlive: boolean
}

export default function CharacterCard({ character }: { character: Character }) {
  const badge = (
    <span
      className={`text-xs px-2 py-0.5 border ${
        character.isAlive
          ? 'border-accent text-accent'
          : 'border-red-700 text-red-700'
      }`}
    >
      {character.isAlive ? 'Alive' : 'Dead'}
    </span>
  )

  const footer = (
    <p className="text-text-muted text-xs">
      Level {character.level} · {character.characterXp} XP
    </p>
  )

  return (
    <GenreCard
      genre={character.genre}
      title={character.name}
      subtitle={`${character.race} · ${character.characterClass.replace('_', ' ')}`}
      badge={badge}
      footer={footer}
    />
  )
}
