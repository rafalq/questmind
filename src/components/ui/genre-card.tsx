'use client'

import ConfirmDialog from '@/components/ui/confirm-dialog'
import type { Genre } from '@/features/character/constants/'
import { genreBg, genreFont, GenreIcon } from '@/lib/genre-theme'
import { IconTrash } from '@tabler/icons-react'
import React, { useState } from 'react'
import ButtonIcon from './button-icon'

type GenreCardProps = {
  genre: Genre
  title: string
  subtitle?: React.ReactNode
  description?: string
  badge?: React.ReactNode
  meta?: React.ReactNode
  footer?: React.ReactNode
  actions?: React.ReactNode
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
  onClick,
  onDelete,
  className,
}: GenreCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div
        onClick={onClick}
        className={`p-6 border border-border flex flex-col gap-2 relative group ${className || ''}`}
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
            <GenreIcon genre={genre} />
            {genre}
          </div>
          {badge && <div>{badge}</div>}
          {meta && <div className="text-[10px] text-text-muted">{meta}</div>}
          {onDelete && (
            <ButtonIcon
              icon={<IconTrash size={16} />}
              tooltip="Delete"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation()
                setIsDialogOpen(true)
              }}
              className="opacity-0 group-hover:opacity-100"
            />
          )}
        </div>

        <h2 className="text-lg font-bold text-text-primary">{title}</h2>

        {subtitle && (
          <div className="text-sm text-text-secondary capitalize">
            {subtitle}
          </div>
        )}

        {description && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {description}
          </p>
        )}

        {actions && <div className="mt-auto pt-3">{actions}</div>}

        {footer && (
          <div className="mt-auto pt-2 border-t border-border/50">{footer}</div>
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
