'use client'

import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCampaign } from '@/features/campaign/actions/create-campaign'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/components/ui/button'
import { LanguageCode, LANGUAGES } from '../constants/languages'
import { useState } from 'react'
import { GenreSchema } from '@/worlds/schema/primitives'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  genre: GenreSchema,
})

type FormValues = z.infer<typeof schema>

export default function CreateCampaignForm() {
  const [language, setLanguage] = useState<LanguageCode>('en')

  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const { execute, isPending } = useAction(createCampaign, {
    onSuccess: () => {
      toast.success('Adventure started!')
      router.push('/dashboard')
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm tracking-wider text-text-secondary mb-2">
          Save Name
        </label>
        <input
          {...register('name')}
          className="w-full px-4 py-3 bg-bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          placeholder="e.g. Tuesday night, The dark path..."
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm tracking-wider text-text-secondary mb-2">
          Genre
        </label>
        <select
          {...register('genre')}
          className="w-full px-4 py-3 bg-bg-surface border border-border text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="fantasy">Fantasy — Tréigthe</option>
          <option value="sci-fi">Sci-Fi — The Drift</option>
          <option value="cyberpunk">Cyberpunk — Neon Warszawa 2087</option>
        </select>
        {errors.genre && (
          <p className="text-red-500 text-sm mt-1">{errors.genre.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm tracking-wider text-text-secondary mb-2">
          Narrative Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          className="w-full px-4 py-3 bg-bg-surface border border-border text-text-primary focus:outline-none focus:border-accent scrollbar-genre"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        size="lg"
        loading={isPending}
        loadingText="Creating..."
        onClick={handleSubmit((data) => execute({ ...data, language }))}
      >
        Begin Adventure
      </Button>
    </div>
  )
}
