'use client'

import { Avatar, type AvatarSize } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { IconCheck, IconLock } from '@tabler/icons-react'

// A row of selectable portraits enforcing per-character uniqueness. Portraits
// already used by the player's other characters are greyscale + locked. An
// optional `defaultOption` is always selectable and exempt from uniqueness — the
// generic fallback when every pooled face is taken.

interface AvatarPickerProps {
  options: string[]
  value: string | null
  onChange: (src: string) => void
  /** URLs used by the player's OTHER characters (exclude the one being edited). */
  taken?: string[]
  /** Always-available generic portrait, shown last, never locked. */
  defaultOption?: string
  name: string
  size?: Extract<AvatarSize, 'md' | 'lg' | 'xl'>
  className?: string
}

export function AvatarPicker({
  options,
  value,
  onChange,
  taken = [],
  defaultOption,
  name,
  size = 'lg',
  className,
}: AvatarPickerProps) {
  const takenSet = new Set(taken)

  const tile = (src: string, i: number, isDefault: boolean) => {
    const selected = src === value
    const isTaken = !isDefault && takenSet.has(src) && !selected
    return (
      <button
        key={src}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-disabled={isTaken}
        disabled={isTaken}
        aria-label={
          isDefault
            ? `${name} default portrait`
            : `${name} portrait ${i + 1}${isTaken ? ' — in use' : ''}`
        }
        onClick={() => onChange(src)}
        className={cn(
          // inline-flex + leading-none: collapse the baseline descender so the
          // button box hugs the circle and the ring doesn't leave a gap.
          'group relative inline-flex rounded-full leading-none transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
          isTaken && 'cursor-not-allowed',
          // Thin green ring, flush to the avatar (no ring-offset -> no dark gap).
          selected && 'ring-2 ring-emerald-500 scale-105',
          !isTaken && !selected && 'hover:scale-105'
        )}
      >
        <Avatar
          src={src}
          alt={
            isDefault ? `${name} default portrait` : `${name} portrait ${i + 1}`
          }
          size={size}
          className={cn('transition', isTaken && 'grayscale opacity-60')}
        />

        {selected && (
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
            <IconCheck size={12} stroke={3} />
          </span>
        )}

        {isTaken && (
          <span className="absolute inset-0 grid place-items-center rounded-full">
            <IconLock size={18} className="text-white/80 drop-shadow" />
          </span>
        )}

        {isDefault && (
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-surface px-1.5 text-[10px] uppercase tracking-wide text-text-muted">
            default
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Choose a portrait"
      className={cn('flex flex-wrap justify-center gap-3', className)}
    >
      {options.map((src, i) => tile(src, i, false))}
      {defaultOption && tile(defaultOption, options.length, true)}
    </div>
  )
}

export default AvatarPicker
