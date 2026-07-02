import { WORLDS } from '@/features/character/constants'
import type { FormData } from '../../../types/wizard-types'

export default function StepWorld({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm">
        Choose the world your story unfolds in.
      </p>
      {WORLDS.map((world) => (
        <button
          key={world.value}
          type="button"
          onClick={() =>
            onChange({
              world: world.value,
              race: null,
              gender: null,
              characterClass: null,
            })
          }
          className={`text-left border px-5 py-4 transition-colors ${
            data.world === world.value
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-text-muted'
          }`}
        >
          <p
            className={`font-semibold ${data.world === world.value ? 'text-accent' : 'text-text-primary'}`}
          >
            {world.name}
            {world.subtitle && (
              <span className="text-text-muted font-normal">
                {' — '}
                {world.subtitle}
              </span>
            )}
          </p>
          <p className="text-text-muted text-sm mt-1">{world.description}</p>
        </button>
      ))}
    </div>
  )
}
