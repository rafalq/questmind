'use client'

import { useCallback, useState } from 'react'

/**
 * Tracks which rows of a list are expanded.
 *
 * Written out three times before this - twice in the stats panel and once on
 * the character sheet - each an identical `useState<Set<string>>` with the
 * same copy-mutate-return toggle. The copy is the part worth centralising:
 * mutating the Set in place and returning it gives React the same reference,
 * so the component does not re-render and the row appears not to open.
 *
 * Click, not hover: the stats panel has to work on touch at 360px (NFR-004),
 * where hover does not exist.
 */
export function useExpandableSet(initial?: Iterable<string>) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initial))

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const isExpanded = useCallback((id: string) => expanded.has(id), [expanded])

  return { isExpanded, toggle }
}
