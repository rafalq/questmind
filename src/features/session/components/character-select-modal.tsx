'use client'

import Button from '@/components/ui/button'
import { useEffect, useState } from 'react'

export type SelectableCharacter = {
  id: string
  name: string
  race: string
  characterClass: string
  level: number
}

type Props = {
  characters: SelectableCharacter[]
  isPending: boolean
  onConfirm: (characterId: string) => void
  onClose: () => void
}

export default function CharacterSelectModal({
  characters,
  isPending,
  onConfirm,
  onClose,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isEmpty = characters.length === 0

  const handleConfirm = () => {
    if (!selectedId) return
    onConfirm(selectedId)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col border border-accent bg-bg-elevated shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-6 pb-4">
          <h2 className="mb-1 text-lg font-bold text-text-primary">
            Choose your character
          </h2>
          <p className="text-sm text-text-muted">
            {"Only characters matching this campaign's genre are shown."}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 scrollbar-subtle">
          {isEmpty ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No available characters for this genre. Create one first.
            </p>
          ) : (
            <ul className="space-y-2">
              {characters.map((character) => (
                <CharacterItem
                  key={character.id}
                  character={character}
                  isSelected={selectedId === character.id}
                  onSelect={() => setSelectedId(character.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border p-6 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!selectedId || isEmpty}
            loading={isPending}
            loadingText="Starting..."
            onClick={handleConfirm}
          >
            Start Adventure
          </Button>
        </div>
      </div>
    </div>
  )
}

type CharacterItemProps = {
  character: SelectableCharacter
  isSelected: boolean
  onSelect: () => void
}

function CharacterItem({
  character,
  isSelected,
  onSelect,
}: CharacterItemProps) {
  return (
    <li
      onClick={onSelect}
      className={`cursor-pointer border px-4 py-3 transition-colors ${
        isSelected
          ? 'border-accent bg-accent/15 text-text-primary'
          : 'border-border text-text-secondary hover:border-accent/70 hover:bg-accent/5'
      }`}
    >
      <p className="font-semibold">{character.name}</p>
      <p className="text-xs text-text-muted">
        Level {character.level} · {character.race} ·{' '}
        {character.characterClass.replaceAll('_', ' ')}
      </p>
    </li>
  )
}
