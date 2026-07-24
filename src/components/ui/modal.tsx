'use client'

import type { Genre } from '@/features/character/constants/'
import { genreFont } from '@/lib/genre-theme'
import { useEffect, useId, useRef, type ReactNode } from 'react'

// The app had three dialogs and three different shells: the character sheet,
// the world lore modal, and the delete confirmation. They disagreed on scrim
// opacity, on whether Escape closed them, and on whether the dialog was
// announced as one at all - ConfirmDialog, the only destructive one, had no
// role, no aria-modal, no Escape and no focus handling whatever.
//
// Behaviour that belongs to every dialog lives here now, so a fourth one
// cannot be built without it.

const SIZE = {
  sm: 'max-w-md max-h-[85dvh]',
  md: 'max-w-lg max-h-[90dvh]',
  lg: 'max-w-2xl max-h-[85dvh]',
} as const

type Props = {
  open: boolean
  onClose: () => void
  /**
   * Scopes --qm-bg-genre so the panel picks up the world's surface colour.
   * Omitted for dialogs that are part of the app chrome rather than of a
   * world, which sit on the base surface instead.
   */
  genre?: Genre
  size?: keyof typeof SIZE
  /**
   * Receives the id the dialog is labelled by. Put it on the heading: an
   * aria-labelledby pointing at nothing is worse than none, because the dialog
   * then announces as unlabelled while looking correct in the markup.
   */
  children: (titleId: string) => ReactNode
}

export default function Modal({
  open,
  onClose,
  genre,
  size = 'md',
  children,
}: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Bound only while open, so a dashboard showing ten campaign cards does not
  // carry ten idle keydown listeners.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Focus moves into the dialog on open so keyboard and screen-reader users
  // land inside it rather than continuing from the element behind, and returns
  // to whatever opened it on close. The return leg is new: previously focus
  // was dropped to the top of the document, so closing the character sheet
  // meant tabbing back through the whole dashboard to reach the next card.
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    return () => previouslyFocused?.focus()
  }, [open])

  // Without this the page behind scrolls under the dialog, which on touch is
  // the more common gesture: a scroll started slightly outside the panel moves
  // the dashboard instead, and the dialog appears frozen.
  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Black in both themes on purpose: a dimmer, not a surface, so it does
          not follow the palette. */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* pointer-events-none on the centring layer, auto on the panel, so a
          click anywhere outside the panel reaches the scrim above and closes.
          The alternative - stopPropagation on the panel - closes the dialog
          whenever a click starts inside it and ends outside, which is what
          selecting text across the edge of a panel does. */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          // data-genre scopes --qm-bg-genre, which has a value per theme.
          // Deliberately not .on-media: there is no artwork behind a dialog,
          // so it should be a light surface in the light theme and take the
          // ordinary text tokens. An inline backgroundColor here used to pin
          // the panel dark in both themes while the text followed the theme,
          // which left near-black text on a near-black panel.
          data-genre={genre}
          className={`pointer-events-auto flex w-full flex-col overflow-y-auto border border-border shadow-xl scrollbar-subtle focus:outline-none ${
            genre ? 'bg-bg-genre' : 'bg-bg-base'
          } ${SIZE[size]}`}
          style={genre ? { fontFamily: genreFont[genre] } : undefined}
        >
          {children(titleId)}
        </div>
      </div>
    </>
  )
}
