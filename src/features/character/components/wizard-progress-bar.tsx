import type { StepId } from '../types/wizard-types'

export default function WizardProgressBar({
  steps,
  currentStepId,
}: {
  steps: { id: StepId; label: string }[]
  currentStepId: StepId
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId)

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 flex items-center justify-center text-xs border transition-colors ${
                i < currentIndex
                  ? 'border-accent bg-accent text-accent-fg'
                  : i === currentIndex
                    ? 'border-accent text-accent'
                    : 'border-border text-text-muted'
              }`}
            >
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i === currentIndex ? 'text-accent' : 'text-text-muted'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-px bg-border w-full relative">
        <div
          className="h-px bg-accent transition-all duration-300 absolute top-0 left-0"
          style={{
            width:
              steps.length > 1
                ? `${(currentIndex / (steps.length - 1)) * 100}%`
                : '0%',
          }}
        />
      </div>
    </div>
  )
}
