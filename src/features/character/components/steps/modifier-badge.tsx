export default function ModifierBadge({
  attr,
  val,
}: {
  attr: string
  val: number
}) {
  return (
    <span
      className={`text-xs px-2 py-0.5 border whitespace-nowrap ${
        val > 0
          ? 'border-emerald-700 text-emerald-500'
          : 'border-red-800 text-red-500'
      }`}
    >
      {val > 0 ? '+' : ''}
      {val} {attr}
    </span>
  )
}
