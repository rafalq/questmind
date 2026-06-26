'use client'

type Option = {
  label: string
  value: string
}

type FilterSelectProps = {
  value: string
  onChange: (value: string) => void
  options: Option[]
}

export default function FilterSelect({
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 bg-bg-surface border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
