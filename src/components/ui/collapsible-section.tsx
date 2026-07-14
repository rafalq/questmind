'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { useState } from 'react'

export default function CollapsibleSection({
  label,
  children,
  defaultOpen = true,
}: {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between text-[10px] text-text-muted/60 hover:text-text-muted uppercase tracking-widest transition-colors mb-2"
      >
        {label}
        <IconChevronDown
          size={12}
          className={`transition-transform duration-200 ${
            isOpen ? '' : '-rotate-90'
          }`}
        />
      </button>

      {/* grid-rows 1fr→0fr animates a collapse without knowing the height,
          which height:auto→0 cannot do. The inner overflow-hidden is what
          actually clips the content. */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
