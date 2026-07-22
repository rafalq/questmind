'use client'

import Button from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { createCharacter } from '@/features/character/actions/create-character'
import { POINT_BUY_TOTAL } from '@/features/character/constants'
import { getWorld } from '@/worlds'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
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

  const topRef = useRef<HTMLDivElement>(null)
  const stepRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  // The nav buttons sit at the bottom of a tall step, so advancing used to
  // drop the player into the middle of the next one. Scroll back to the
  // progress bar and move focus into the step, so keyboard and screen-reader
  // users land in the same place as everyone else.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    topRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    // preventScroll: the scrollIntoView above owns the scrolling; letting
    // focus() scroll as well fights it and lands somewhere in between.
    stepRef.current?.focus({ preventScroll: true })
  }, [stepIndex])

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
    // The page container this sits in is shrink-to-fit, so a percentage width
    // (w-full) resolves against a parent that is itself sized by content —
    // which is why steps with portraits (race/class) were wide and the
    // Attributes step was narrow. An explicit width breaks that dependency:
    // the container grows to 64rem and every step matches. max-w-full keeps
    // it from overflowing on small screens. Tune 64rem to taste.
    //
    // scroll-mt-24 keeps the progress bar clear of the fixed navbar when the
    // step change scrolls back up here.
    <div ref={topRef} className="w-5xl max-w-full mx-auto scroll-mt-24">
      <WizardProgressBar steps={activeSteps} currentStepId={currentStep.id} />

      {/* tabIndex -1 makes the step focusable programmatically without adding
          it to the tab order; outline-none hides the ring, since the scroll
          already shows where we are. */}
      <div
        ref={stepRef}
        tabIndex={-1}
        aria-label={`Step ${stepIndex + 1} of ${activeSteps.length}: ${currentStep.label}`}
        className="min-h-100 outline-none"
      >
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
              onClick={handleReset}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <IconRefresh stroke={2} size={16} />
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
