// steps/summary/name-input.tsx
export default function NameInput({
  value,
  onChange,
}: {
  value: string
  onChange: (name: string) => void
}) {
  return (
    <div>
      <label className="block text-sm text-text-secondary mb-2 tracking-wider uppercase">
        Character Name
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a name..."
        maxLength={60}
        className="w-full bg-transparent border border-border px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
