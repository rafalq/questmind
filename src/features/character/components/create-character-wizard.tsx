'use client'

import Button from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { createCharacter } from '@/features/character/actions/create-character'
import { POINT_BUY_TOTAL } from '@/features/character/constants'
import { getWorld } from '@/worlds'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  type FormData,
  type StepId,
  ALL_STEPS,
  DEFAULT_ATTRIBUTES,
} from '../types/wizard-types'
import StepAttributes from './steps/attributes'
import StepClass from './steps/class'
import StepRace from './steps/race'
import StepSex from './steps/sex'
import StepSummary from './steps/summary'
import StepWorld from './steps/world'
import WizardProgressBar from './wizard-progress-bar'
import { IconRefresh } from '@tabler/icons-react'

const INITIAL_DATA: FormData = {
  name: '',
  world: null,
  race: null,
  gender: null,
  characterClass: null,
  attributes: DEFAULT_ATTRIBUTES,
}

const STEP_COMPONENTS: Record<
  StepId,
  React.ComponentType<{
    data: FormData
    onChange: (patch: Partial<FormData>) => void
  }>
> = {
  world: StepWorld,
  race: StepRace,
  sex: StepSex,
  class: StepClass,
  attributes: StepAttributes,
  summary: StepSummary,
}

export default function CreateCharacterWizard() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<FormData>(INITIAL_DATA)

  // The "sex" step only exists for races that have one — genderless races
  // (e.g. demigod) skip straight from Race to Class.
  const activeSteps = useMemo(() => {
    const selectedRace = data.world
      ? getWorld(data.world).races.find((r) => r.value === data.race)
      : undefined

    if (selectedRace?.genderless) {
      return ALL_STEPS.filter((s) => s.id !== 'sex')
    }
    return ALL_STEPS
  }, [data.world, data.race])

  const currentStep =
    activeSteps[stepIndex] ?? activeSteps[activeSteps.length - 1]
  const StepComponent = STEP_COMPONENTS[currentStep.id]

  const { execute, isPending } = useAction(createCharacter, {
    onSuccess: () => {
      toast.success('Character created!')
      setData(INITIAL_DATA)
      setStepIndex(0)
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
    setStepIndex(0)
  }

  // Clamp stepIndex if the active steps array just shrank (e.g. player
  // picked a genderless race while sitting on a later step index).
  const goNext = () => {
    setStepIndex((i) => Math.min(i + 1, activeSteps.length - 1))
  }
  const goBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  const canProceed = () => {
    switch (currentStep.id) {
      case 'world':
        return data.world !== null
      case 'race':
        return data.race !== null
      case 'sex':
        return data.gender !== null
      case 'class':
        return data.characterClass !== null
      case 'attributes': {
        const total = Object.values(data.attributes).reduce((s, v) => s + v, 0)
        return total === POINT_BUY_TOTAL
      }
      case 'summary':
        return data.name.trim().length > 0
      default:
        return true
    }
  }

  const handleSubmit = () => {
    if (!data.world || !data.race || !data.characterClass) return

    execute({
      name: data.name,
      world: data.world,
      race: data.race,
      characterClass: data.characterClass,
      gender: data.gender ?? undefined,
      attributes: data.attributes,
    })
  }

  const isLastStep = stepIndex === activeSteps.length - 1

  return (
    <div>
      <WizardProgressBar steps={activeSteps} currentStepId={currentStep.id} />

      <div className="min-h-100">
        <StepComponent data={data} onChange={onChange} />
      </div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="disabled:opacity-0"
          >
            ← Back
          </Button>
          {stepIndex > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <IconRefresh stroke={2} size={14} />
              Reset
            </Button>
          )}
        </div>

        {!isLastStep ? (
          <Button onClick={goNext} disabled={!canProceed()}>
            Next →
          </Button>
        ) : (
          <Button
            size="lg"
            loading={isPending}
            loadingText="Creating..."
            onClick={handleSubmit}
            disabled={!canProceed()}
          >
            Create Character
          </Button>
        )}
      </div>
    </div>
  )
}
