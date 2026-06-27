'use client'

import GenreCard from '@/components/ui/genre-card'
import { toast } from 'sonner'
import { deleteCharacter } from '../actions/delete-character'
import { useAction } from 'next-safe-action/hooks'

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
  const { execute, isPending } = useAction(deleteCharacter, {
    onSuccess: () => toast.success('Character deleted.'),
    onError: () => toast.error('Something went wrong. Please try again.'),
  })

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
      onDelete={{
        label: 'Delete Character',
        message: `Are you sure you want to delete "${character.name}"? This action cannot be undone.`,
        onConfirm: () => execute({ id: character.id }),
        isPending,
      }}
    />
  )
}
