// steps/attributes/hp-summary.tsx
export default function HpSummary({ maxHp }: { maxHp: number }) {
  return (
    <div className="border border-border px-5 py-3 flex items-center justify-between">
      <span className="text-text-secondary text-sm">Max HP</span>
      <span className="text-accent font-bold text-lg">{maxHp}</span>
    </div>
  )
}
