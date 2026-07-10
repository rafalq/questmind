'use client'

import { useAction } from 'next-safe-action/hooks'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { renameCampaign } from '../actions/rename-campaign'

type Props = {
  campaignId: string
  name: string
}

export default function CampaignEditableTitle({ campaignId, name }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(name)
  const cancelled = useRef(false)

  const { execute, isPending } = useAction(renameCampaign, {
    onSuccess: () => {
      toast.success('Campaign renamed.')
      setIsEditing(false)
    },
    onError: () => {
      toast.error('Could not rename campaign.')
      setValue(name)
      setIsEditing(false)
    },
  })

  function commit() {
    if (cancelled.current) {
      cancelled.current = false
      setValue(name)
      setIsEditing(false)
      return
    }
    const trimmed = value.trim()
    if (trimmed === '' || trimmed === name) {
      setValue(name)
      setIsEditing(false)
      return
    }
    execute({ id: campaignId, name: trimmed })
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setValue(name) // resync z aktualnym propsem
          setIsEditing(true)
        }}
        title="Click to rename"
        className="text-left text-lg font-bold text-text-primary hover:text-accent transition-colors"
        style={{ fontFamily: 'inherit' }}
      >
        {name}
      </button>
    )
  }

  return (
    <input
      autoFocus
      aria-label="Campaign name"
      value={value}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        }
        if (e.key === 'Escape') {
          cancelled.current = true
          e.currentTarget.blur()
        }
      }}
      className="w-full bg-transparent text-lg font-bold text-text-primary border-b border-accent outline-none"
      style={{ fontFamily: 'inherit' }}
    />
  )
}
