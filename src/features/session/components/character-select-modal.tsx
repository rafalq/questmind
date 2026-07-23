'use client'

import Button from '@/components/ui/button'
import { useEffect, useId, useRef, useState } from 'react'

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
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Focus lands inside the dialog rather than continuing from the card behind.
  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  const isEmpty = characters.length === 0

  const handleConfirm = () => {
    if (!selectedId) return
    onConfirm(selectedId)
  }

  return (
    // on-surface is doing real work here. This modal is rendered from
    // PlayButton, which sits in GenreCard's `actions` slot — so in the DOM it
    // is a descendant of a .on-media card, and custom properties inherit down
    // the tree regardless of position:fixed. It was picking up the
    // light-on-artwork palette and painting cream text on its own white panel.
    // on-surface restores the ordinary theme palette for this subtree.
    <div
      className="on-surface fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[85dvh] w-full max-w-md flex-col border border-accent bg-bg-elevated shadow-2xl focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-4 pb-3 sm:p-6 sm:pb-4">
          <h2 id={titleId} className="mb-1 text-lg font-bold text-text-primary">
            Choose your character
          </h2>
          <p className="text-sm text-text-secondary">
            {"Only characters matching this campaign's genre are shown."}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-subtle sm:px-6">
          {isEmpty ? (
            <p className="py-8 text-center text-sm text-text-secondary">
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

        <div className="flex justify-end gap-3 border-t border-border p-4 pt-3 sm:p-6 sm:pt-4">
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
    // A <li> with onClick is invisible to keyboards and screen readers. The
    // row is a radio in everything but markup — one of N, exactly one chosen —
    // so it says so, and Space/Enter work for free on a real button.
    <li>
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        onClick={onSelect}
        className={`w-full cursor-pointer border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
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
      </button>
    </li>
  )
}
