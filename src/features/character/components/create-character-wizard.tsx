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
import Button from '@/components/ui/button'

const INITIAL_DATA: FormData = {
  name: '',
  genre: null,
  race: null,
  characterClass: null,
  backgroundStory: '',
  attributes: DEFAULT_ATTRIBUTES,
}

export default function CreateCharacterWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INITIAL_DATA)

  const { execute, isPending } = useAction(createCharacter, {
    onSuccess: () => {
      toast.success('Character created!')
      setData(INITIAL_DATA)
      setStep(1)
      router.push(ROUTES.dashboard)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Something went wrong.')
    },
  })

  const onChange = (patch: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...patch }))
  }

  const handleReset = () => {
    setData(INITIAL_DATA)
    setStep(1)
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
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="disabled:opacity-0"
          >
            ← Back
          </Button>
          {step > 1 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
            >
              Reset
            </Button>
          )}
        </div>

        {step < STEPS.length ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Next →
          </Button>
        ) : (
          <Button
            size="lg"
            loading={isPending}
            loadingText="Creating..."
            onClick={handleSubmit}
          >
            Create Character
          </Button>
        )}
      </div>
    </div>
  )
}
