'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { createCharacter } from '@/features/character/actions/create-character'
import { ROUTES } from '@/constants/routes'
import { POINT_BUY_TOTAL } from '@/features/character/constants'
import { type FormData, DEFAULT_ATTRIBUTES, STEPS } from '../types/wizard-types'
import WizardProgressBar from './wizard-progress-bar'
import StepBasics from './step-basics'
import StepRace from './step-race'
import StepClass from './step-class'
import StepAttributes from './step-attributes'
import StepStory from './step-story'

export default function CreateCharacterWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>({
    name: '',
    genre: null,
    race: null,
    characterClass: null,
    backgroundStory: '',
    attributes: DEFAULT_ATTRIBUTES,
  })

  const { execute, isPending } = useAction(createCharacter, {
    onSuccess: () => {
      toast.success('Character created!')
      router.push(ROUTES.characters)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Something went wrong.')
    },
  })

  const onChange = (patch: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...patch }))
  }

  const canProceed = () => {
    if (step === 1) return data.name.trim().length > 0 && data.genre !== null
    if (step === 2) return data.race !== null
    if (step === 3) return data.characterClass !== null
    if (step === 4) {
      const total = Object.values(data.attributes).reduce((s, v) => s + v, 0)
      return total === POINT_BUY_TOTAL
    }
    return true
  }

  const handleSubmit = () => {
    if (!data.genre || !data.race || !data.characterClass) return
    execute({
      name: data.name,
      genre: data.genre,
      race: data.race,
      characterClass: data.characterClass,
      backgroundStory: data.backgroundStory || undefined,
      attributes: data.attributes,
    })
  }

  return (
    <div>
      <WizardProgressBar step={step} />

      <div className="min-h-100">
        {step === 1 && <StepBasics data={data} onChange={onChange} />}
        {step === 2 && <StepRace data={data} onChange={onChange} />}
        {step === 3 && <StepClass data={data} onChange={onChange} />}
        {step === 4 && <StepAttributes data={data} onChange={onChange} />}
        {step === 5 && <StepStory data={data} onChange={onChange} />}
      </div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="px-5 py-2 border border-border text-text-secondary hover:border-text-muted hover:text-text-primary disabled:opacity-0 transition-all text-sm"
        >
          ← Back
        </button>

        {step < STEPS.length ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="px-5 py-2 border border-accent text-accent hover:bg-accent hover:text-accent-fg disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm tracking-wider"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2 border border-accent text-accent hover:bg-accent hover:text-accent-fg disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm tracking-wider"
          >
            {isPending ? 'Creating...' : 'Create Character'}
          </button>
        )}
      </div>
    </div>
  )
}
