import { STEPS } from '../types/wizard-types'

export default function WizardProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 flex items-center justify-center text-xs border transition-colors ${
                i + 1 < step
                  ? 'border-accent bg-accent text-accent-fg'
                  : i + 1 === step
                    ? 'border-accent text-accent'
                    : 'border-border text-text-muted'
              }`}
            >
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i + 1 === step ? 'text-accent' : 'text-text-muted'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-px bg-border w-full relative">
        <div
          className="h-px bg-accent transition-all duration-300 absolute top-0 left-0"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
