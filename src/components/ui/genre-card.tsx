'use client'

import { useState } from 'react'
import { IconTrash } from '@tabler/icons-react'
import { genreFont, genreBg, genreIcon } from '@/lib/genre-config'
import type { Genre } from '@/features/character/constants'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import ButtonIcon from './button-icon'

type GenreCardProps = {
  genre: Genre
  title: string
  subtitle?: string
  description?: string
  badge?: React.ReactNode
  meta?: string
  footer?: React.ReactNode
  onDelete?: {
    label: string
    message: string
    onConfirm: () => void
    isPending?: boolean
  }
}

export default function GenreCard({
  genre,
  title,
  subtitle,
  description,
  badge,
  meta,
  footer,
  onDelete,
}: GenreCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div
        className="p-6 border border-border flex flex-col gap-2 relative group"
        style={{
          fontFamily: genreFont[genre],
          backgroundColor: genreBg[genre],
        }}
      >
        <div
          className="flex items-center justify-between gap-1.5 text-xs text-text-muted uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          <div className="flex items-center gap-1">
            {genreIcon[genre]}
            {genre}
          </div>
          {badge && <div>{badge}</div>}
          {meta && <p className="text-[10px] text-text-muted">{meta}</p>}
        </div>

        <h2 className="text-lg font-bold text-text-primary">{title}</h2>

        {subtitle && (
          <p className="text-sm text-text-secondary capitalize">{subtitle}</p>
        )}

        {description && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {description}
          </p>
        )}

        {footer && (
          <div className="mt-auto pt-2 border-t border-border/50">{footer}</div>
        )}
        {onDelete && (
          <ButtonIcon
            icon={<IconTrash size={16} />}
            tooltip="Delete"
            variant="danger"
            onClick={() => setIsDialogOpen(true)}
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
          />
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
