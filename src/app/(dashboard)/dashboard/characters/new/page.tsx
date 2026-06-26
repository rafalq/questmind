import { ROUTES } from '@/constants/routes'
import CreateCharacterWizard from '@/features/character/components/create-character-wizard'
import Link from 'next/link'

export default function NewCharacterPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <div className="mb-10">
        <Link
          href={ROUTES.characters}
          className="text-text-muted text-sm hover:text-text-secondary transition-colors"
        >
          ← Back to Characters
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mt-4">
          Create Character
        </h1>
        <p className="text-text-secondary mt-1">
          Build your adventurer step by step.
        </p>
      </div>
      <CreateCharacterWizard />
    </div>
  )
}
