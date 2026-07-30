'use client'

import { useState } from 'react'
import Modal from '@/components/ui/modal'
import HowToStart from './how-to-start'
import { IconInfoCircle, IconX } from '@tabler/icons-react'

type Props = {
  // Passed through to HowToStart so the modal can show progress when the
  // caller has the counts; omit for the plain reference guide.
  campaignCount?: number
  characterCount?: number
  // Own trigger (e.g. a navbar item) instead of the default button — same
  // escape hatch WorldLoreModal uses.
  trigger?: (open: () => void) => React.ReactNode
}

export default function HowToStartModal({
  campaignCount,
  characterCount,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex cursor-pointer items-center gap-1.5 text-[11px] uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          <IconInfoCircle size={13} />
          Getting Started
        </button>
      )}

      {/* No genre: this is app chrome, not a world, so it sits on the base
          surface and takes the ordinary text tokens via .on-surface. */}
      <Modal open={open} onClose={close} size="lg">
        {(titleId) => (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-border/50 p-4 sm:p-6">
              <div className="min-w-0">
                <p
                  className="mb-1 text-xs uppercase tracking-widest text-text-secondary"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                >
                  <IconInfoCircle size={12} className="mr-1 inline" />
                  Guide
                </p>
                <h2
                  id={titleId}
                  className="text-xl font-bold text-text-primary sm:text-2xl"
                >
                  Getting Started
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="-m-2 shrink-0 cursor-pointer p-2 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <IconX size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <HowToStart
                campaignCount={campaignCount}
                characterCount={characterCount}
              />
            </div>
          </>
        )}
      </Modal>
    </>
  )
}
