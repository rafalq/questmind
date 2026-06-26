'use client'

import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCampaign } from '@/features/campaign/actions/create-campaign'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/components/ui/button'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  genre: z.enum(['fantasy', 'sci-fi', 'cyberpunk']),
  description: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

export default function CreateCampaignForm() {
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
      toast.success('Campaign created successfully!')
      router.push('/dashboard')
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm tracking-wider text-text-secondary mb-2">
          Campaign Name
        </label>
        <input
          {...register('name')}
          className="w-full px-4 py-3 bg-bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          placeholder="e.g. The Forgotten Realm"
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
          <option value="fantasy">Fantasy</option>
          <option value="sci-fi">Sci-Fi</option>
          <option value="cyberpunk">Cyberpunk</option>
        </select>
        {errors.genre && (
          <p className="text-red-500 text-sm mt-1">{errors.genre.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm tracking-wider text-text-secondary mb-2">
          Description <span className="text-text-muted">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-4 py-3 bg-bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
          placeholder="Describe your campaign setting..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <Button
        size="lg"
        loading={isPending}
        loadingText="Creating..."
        onClick={handleSubmit((data) => execute(data))}
      >
        Create Campaign
      </Button>
    </div>
  )
}
