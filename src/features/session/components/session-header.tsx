'use client'

import { ROUTES } from '@/constants/routes'
import WorldLoreModal from '@/features/lore/components/world-lore-modal'
import { type WorldLore } from '@/features/lore/queries/get-world-lore'
import type { Genre } from '@/features/character/constants/'
import {
  IconArrowLeft,
  IconBook,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react'
import Link from 'next/link'
import ZenToggle from './zen-toggle'

type Props = {
  campaignName: string
  genre: Genre
  lore: WorldLore | null
  /** null while the player has not chosen; see useSidePanel. */
  isPanelOpen: boolean | null
  onTogglePanel: () => void
  /** Zen wiring is optional so other callers of this header still compile. */
  isZen?: boolean
  onToggleZen?: () => void
}

export default function SessionHeader({
  campaignName,
  genre,
  lore,
  isPanelOpen,
  onTogglePanel,
  isZen = false,
  onToggleZen,
}: Props) {
  return (
    <div
      data-zen-hide
      className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4"
    >
      <Link
        href={ROUTES.dashboard}
        className="shrink-0 text-text-muted transition-colors hover:text-accent"
        aria-label="Back to dashboard"
        title="Back to dashboard"
      >
        <IconArrowLeft size={20} />
      </Link>

      {/* min-w-0 is what lets the h2 below actually truncate. Without it this
          group is sized by its content, so a long campaign name grows the
          group instead of clipping and pushes the panel toggle off the right
          edge - the same failure GenreCard's title row already guards
          against. */}
      <div className="flex min-w-0 items-center justify-center gap-2">
        <h2 className="truncate text-base font-bold text-text-primary sm:text-lg">
          {campaignName}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {lore && (
          <WorldLoreModal
            genre={genre}
            lore={lore}
            trigger={(open) => (
              <button
                onClick={open}
                aria-label="World lore"
                title="World lore"
                className="shrink-0 p-1.5 text-text-muted transition-colors hover:text-accent"
              >
                <IconBook size={20} />
              </button>
            )}
          />
        )}
        {onToggleZen && (
          <ZenToggle isZen={isZen} onToggle={onToggleZen} variant="header" />
        )}

        <button
          type="button"
          onClick={onTogglePanel}
          className="shrink-0 p-1.5 text-text-muted transition-colors hover:text-accent"
          aria-label="Toggle stats panel"
          title={isPanelOpen ? 'Hide stats panel' : 'Show stats panel'}
          aria-expanded={isPanelOpen ?? undefined}
        >
          {isPanelOpen === null ? (
            // Undecided: the icon has to agree with what CSS is showing, so it
            // switches at the same breakpoint the panel does.
            <>
              <IconLayoutSidebarRightExpand
                size={20}
                className="lg:hidden"
                aria-hidden
              />
              <IconLayoutSidebarRightCollapse
                size={20}
                className="hidden lg:block"
                aria-hidden
              />
            </>
          ) : isPanelOpen ? (
            <IconLayoutSidebarRightCollapse size={20} aria-hidden />
          ) : (
            <IconLayoutSidebarRightExpand size={20} aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}
