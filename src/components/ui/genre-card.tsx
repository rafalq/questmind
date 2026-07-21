'use client'

import ConfirmDialog from '@/components/ui/confirm-dialog'
import type { Genre } from '@/features/character/constants/'
import { genreFont, GenreIcon } from '@/lib/genre-theme'
import { IconTrash } from '@tabler/icons-react'
import React, { useState } from 'react'
import ButtonIcon from './button-icon'

type GenreCardProps = {
  genre: Genre
  title: React.ReactNode
  subtitle?: React.ReactNode
  description?: string
  badge?: React.ReactNode
  meta?: React.ReactNode
  footer?: React.ReactNode
  actions?: React.ReactNode
  avatar?: React.ReactNode
  imageUrl?: string
  onClick?: () => void
  onDelete?: {
    label: string
    message: string
    onConfirm: () => void
    isPending?: boolean
  }
  className?: string
}

export default function GenreCard({
  genre,
  title,
  subtitle,
  description,
  badge,
  meta,
  footer,
  actions,
  avatar,
  imageUrl,
  onClick,
  onDelete,
  className,
}: GenreCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div
        onClick={onClick}
        // data-genre scopes the genre tint (--qm-bg-genre), which now has a
        // value per theme instead of one hardcoded colour.
        //
        // on-media is the important one: this card is always a dark surface,
        // because the artwork sits under a dark overlay in both themes. The
        // text tokens must therefore stay light regardless of the theme —
        // which is exactly what .on-media overrides. Without it, light mode
        // resolved text-text-primary to near-black and painted it on a dark
        // image, which is why the cards were unreadable.
        data-genre={genre}
        className={`on-media group relative flex h-full flex-col gap-2 border border-border bg-bg-genre bg-cover p-4 sm:p-6 ${
          className || ''
        }`}
        style={{
          fontFamily: genreFont[genre],
          backgroundPosition: 'center 30%',
          ...(imageUrl && {
            // Overlay strength comes from the theme token so it can be tuned
            // in one place; the fallback keeps the card readable if the
            // variable is ever missing.
            backgroundImage: `linear-gradient(rgb(var(--qm-image-overlay, 10 8 5 / 0.82)), rgb(var(--qm-image-overlay, 10 8 5 / 0.82))), url("${imageUrl}")`,
          }),
        }}
      >
        {/* Meta row. Two groups, not four siblings sharing one justify-between:
            the genre label may shrink and truncate, everything on the right
            keeps its intrinsic width. This is what stopped "Last played:"
            from wrapping onto a second line and colliding with the title. */}
        <div
          className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-widest text-text-muted"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          <div className="flex min-w-0 items-center gap-1">
            <span className="shrink-0">
              <GenreIcon genre={genre} />
            </span>
            <span className="truncate">{genre}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {badge && <div className="whitespace-nowrap">{badge}</div>}
            {meta && (
              <div className="whitespace-nowrap text-[10px] text-text-muted">
                {meta}
              </div>
            )}
            {onDelete && (
              <ButtonIcon
                icon={<IconTrash size={16} />}
                tooltip="Delete"
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDialogOpen(true)
                }}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              />
            )}
          </div>
        </div>

        <div className="flex items-start justify-between gap-3">
          {/* min-w-0 lets the heading actually shrink inside the flex row;
              without it a long campaign name pushes the avatar off the card.
              break-words handles single long tokens the clamp cannot split. */}
          <h2 className="min-w-0 break-words text-base font-bold text-text-primary sm:text-lg">
            {title}
          </h2>
          {avatar && <div className="shrink-0">{avatar}</div>}
        </div>

        {subtitle && (
          <div className="text-sm capitalize text-text-secondary">
            {subtitle}
          </div>
        )}

        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
            {description}
          </p>
        )}

        {actions && <div className="mt-auto pt-3">{actions}</div>}

        {footer && (
          <div className="mt-auto border-t border-border/50 pt-2">{footer}</div>
        )}
      </div>

      {onDelete && (
        <ConfirmDialog
          isOpen={isDialogOpen}
          title={onDelete.label}
          message={onDelete.message}
          onConfirm={onDelete.onConfirm}
          onCancel={() => setIsDialogOpen(false)}
          isPending={onDelete.isPending}
        />
      )}
    </>
  )
}
