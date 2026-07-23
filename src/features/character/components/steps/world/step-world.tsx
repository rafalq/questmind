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
      <p className="text-sm text-text-secondary">
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
            aria-pressed={selected}
            onClick={() =>
              onChange({
                world: world.value,
                race: null,
                gender: null,
                characterClass: null,
              })
            }
            // on-media: the artwork under this button stays dark in both
            // themes, so its text has to stay light. Without it the light
            // theme resolved text-text-primary to near-black on a dark photo.
            //
            // min-h-36 with the copy clamped: card height used to follow the
            // description, so Neon Warszawa (the longest blurb) rendered
            // noticeably taller than Tréigthe in the same list.
            className={`on-media relative flex min-h-36 flex-col justify-center overflow-hidden border bg-cover px-4 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-5 ${
              disabled
                ? 'cursor-not-allowed border-border grayscale-[0.5]'
                : selected
                  ? 'border-accent'
                  : 'border-border hover:border-accent/60'
            }`}
            style={{
              // Same scrim token as the cards and the hero, so artwork dimming
              // is tuned in one place per theme rather than three.
              backgroundImage: `linear-gradient(rgb(var(--qm-image-overlay, 0 0 0 / 0.72)), rgb(var(--qm-image-overlay, 0 0 0 / 0.72))), url("${world.cardImageUrl}")`,
              backgroundPosition: 'center 25%',
            }}
          >
            <p
              className={`font-semibold ${selected ? 'text-accent' : 'text-text-primary'}`}
            >
              {world.name}
              <span className="font-normal text-text-secondary">
                {' — '}
                {world.subtitle}
              </span>
              {disabled && (
                <span className="ml-2 align-middle text-xs font-normal tracking-widest text-accent">
                  · COMING SOON
                </span>
              )}
            </p>
            {/* Clamped rather than truncated mid-word: three lines is enough
                to convey the setting, and it keeps every card the same size. */}
            <p className="mt-1 line-clamp-3 text-sm text-text-secondary">
              {world.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
