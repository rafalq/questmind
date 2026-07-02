// steps/attributes/points-remaining-badge.tsx
export default function PointsRemainingBadge({
  remaining,
}: {
  remaining: number
}) {
  return (
    <span
      className={`text-sm font-semibold px-3 py-1 border ${
        remaining === 0
          ? 'border-accent text-accent'
          : remaining < 0
            ? 'border-red-700 text-red-500'
            : 'border-border text-text-secondary'
      }`}
    >
      {remaining} left
    </span>
  )
}
