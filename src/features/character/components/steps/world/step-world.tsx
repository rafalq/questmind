import { WORLDS } from '@/worlds'
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
      {WORLDS.map((world) => {
        const selected = data.world === world.value
        const disabled = !world.enabled
        return (
          <button
            key={world.value}
            type="button"
            disabled={disabled}
            aria-disabled={disabled}
            onClick={() =>
              onChange({
                world: world.value,
                race: null,
                gender: null,
                characterClass: null,
              })
            }
            className={`relative overflow-hidden text-left border px-5 py-4 transition-colors bg-cover ${
              disabled
                ? 'border-border cursor-not-allowed grayscale-[0.5]'
                : selected
                  ? 'border-accent'
                  : 'border-border hover:border-text-muted'
            }`}
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(10,8,5,0.80) 0%, rgba(10,8,5,0.50) 50%, rgba(10,8,5,0.68) 100%), url("${world.cardImageUrl}")`,
              backgroundPosition: 'center 25%',
            }}
          >
            <p
              className={`font-semibold ${selected ? 'text-accent' : 'text-text-primary'}`}
            >
              {world.name}
              <span className="text-text-primary/80 font-normal">
                {' — '}
                {world.subtitle}
              </span>
              {disabled && (
                <span className="text-accent/90 font-normal text-xs tracking-widest ml-2 align-middle">
                  · COMING SOON
                </span>
              )}
            </p>
            <p className="text-text-primary/90 text-sm mt-1">
              {world.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
