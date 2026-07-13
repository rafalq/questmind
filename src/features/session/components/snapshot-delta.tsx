// src/features/session/components/snapshot-delta.tsx
import type { SnapshotChange } from '@/features/session/lib/snapshot-diff'
import {
  IconHeart,
  IconBackpack,
  IconMapSearch,
  IconCheck,
  IconBolt,
} from '@tabler/icons-react'

/**
 * Mechanical consequences of a turn, derived from the snapshot delta — never
 * from the prose. Sits under the GM message, deliberately styled as system
 * output rather than narration: small, monospaced numbers, no serif.
 */
export default function SnapshotDelta({
  changes,
}: {
  changes: SnapshotChange[]
}) {
  if (changes.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-2 border-t border-border/40 text-xs font-sans">
      {changes.map((change, i) => (
        <ChangeItem key={i} change={change} />
      ))}
    </div>
  )
}

function ChangeItem({ change }: { change: SnapshotChange }) {
  switch (change.kind) {
    case 'hp': {
      const isLoss = change.delta < 0
      return (
        <span
          className={`flex items-center gap-1 tabular-nums ${
            isLoss ? 'text-red-400' : 'text-emerald-400'
          }`}
        >
          <IconHeart size={12} stroke={2} />
          {isLoss ? '' : '+'}
          {change.delta} HP
        </span>
      )
    }

    case 'item-gained':
      return (
        <span className="flex items-center gap-1 text-text-secondary">
          <IconBackpack size={12} />+{change.name}
          {change.qty > 1 && (
            <span className="text-text-muted">×{change.qty}</span>
          )}
        </span>
      )

    case 'item-lost':
      return (
        <span className="flex items-center gap-1 text-text-muted line-through decoration-text-muted/50">
          <IconBackpack size={12} />−{change.name}
          {change.qty > 1 && <span>×{change.qty}</span>}
        </span>
      )

    case 'quest-added':
      return (
        <span className="flex items-center gap-1 text-accent">
          <IconMapSearch size={12} />
          {change.title}
        </span>
      )

    case 'quest-completed':
      return (
        <span className="flex items-center gap-1 text-emerald-400">
          <IconCheck size={12} stroke={2.5} />
          {change.title}
        </span>
      )

    case 'ability':
      return (
        <span className="flex items-center gap-1 text-accent">
          <IconBolt size={12} />
          {change.name}
        </span>
      )
  }
}
