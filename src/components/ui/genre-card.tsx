import { genreFont, genreBg, genreIcon } from '@/lib/genre-config'
import type { Genre } from '@/features/character/constants'

type GenreCardProps = {
  genre: Genre
  title: string
  subtitle?: string
  description?: string
  badge?: React.ReactNode
  meta?: string
  footer?: React.ReactNode
}

export default function GenreCard({
  genre,
  title,
  subtitle,
  description,
  badge,
  meta,
  footer,
}: GenreCardProps) {
  return (
    <div
      className="p-6 border border-border flex flex-col gap-2"
      style={{
        fontFamily: genreFont[genre],
        backgroundColor: genreBg[genre],
      }}
    >
      {/* Header row — genre label + badge/meta */}
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

      {/* Title */}
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-text-secondary capitalize">{subtitle}</p>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-text-secondary mt-1 line-clamp-2">
          {description}
        </p>
      )}

      {/* Footer */}
      {footer && (
        <div className="mt-auto pt-2 border-t border-border/50">{footer}</div>
      )}
    </div>
  )
}
