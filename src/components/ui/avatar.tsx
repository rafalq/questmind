'use client'

import { cn } from '@/lib/utils'
import { IconUser } from '@tabler/icons-react'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'

// Presentation-only avatar. It knows nothing about characters, worlds or the
// registry — a parent resolves the portrait URL and the fallback and passes
// them in. Same rule as GenreCard: this component only renders.

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarShape = 'circle' | 'portrait'

// For `circle` this is the diameter; for `portrait` it is the width, and the
// height is derived from the artwork's 3:4 ratio. Driven by inline style so a
// runtime-picked size can never be purged by Tailwind.
const SIZE_PX: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 112,
}

export interface AvatarProps {
  /** Portrait URL. If absent or it fails to load, the fallback is shown. */
  src?: string | null
  /** Required for accessibility — the character or speaker name. */
  alt: string
  size?: AvatarSize
  /** `circle` for message bubbles and card avatar slots; `portrait` (3:4) for a showcase. */
  shape?: AvatarShape
  /** Rendered when there is no image — e.g. a class icon. Defaults to a generic user icon. */
  fallback?: ReactNode
  className?: string
}

export function Avatar({
  src,
  alt,
  size = 'md',
  shape = 'circle',
  fallback,
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false)

  const width = SIZE_PX[size]
  const height = shape === 'portrait' ? Math.round((width * 4) / 3) : width
  const showImage = Boolean(src) && !failed

  return (
    <span
      // In fallback mode the icon is decorative, so the wrapper carries the
      // accessible name instead. With an image, next/image owns the alt text.
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : alt}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden',
        // Fallback tile colours. Swap `bg-surface` for your surface token if
        // it is named differently (e.g. bg-card / bg-background).
        'bg-surface text-text-muted ring-1 ring-border/60',
        shape === 'circle' ? 'rounded-full' : 'rounded-lg',
        className
      )}
      style={{ width, height }}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={`${width}px`}
          onError={() => setFailed(true)}
          className={cn(
            'object-cover',
            // Bust portraits read best cropped toward the head in a circle.
            shape === 'circle' ? 'object-top' : 'object-center'
          )}
        />
      ) : (
        <span aria-hidden className="flex items-center justify-center">
          {fallback ?? <IconUser size={Math.round(width * 0.5)} stroke={1.5} />}
        </span>
      )}
    </span>
  )
}

export default Avatar
