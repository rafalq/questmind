import { genreFont } from '@/lib/genre-config'
import type { Genre } from '@/features/character/constants'
import { IconEye, IconUser } from '@tabler/icons-react'

type Props = {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  isNarration?: boolean
  characterName?: string
  genre: Genre
}

export default function MessageBubble({
  role,
  content,
  isStreaming,
  isNarration,
  characterName,
  genre,
}: Props) {
  const isAssistant = role === 'assistant'

  return (
    <div
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
      style={{ fontFamily: genreFont[genre] }}
    >
      <div
        className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
          isNarration
            ? 'border border-accent/30 text-text-secondary italic bg-bg-elevated w-full max-w-full text-center'
            : isAssistant
              ? 'bg-surface border border-border text-text-primary'
              : 'bg-accent text-accent-fg'
        }`}
      >
        {isNarration && (
          <p className="text-xs text-accent mb-3 not-italic font-semibold uppercase tracking-widest">
            ✦ QuestMind
          </p>
        )}
        {!isNarration && isAssistant && (
          <div className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-widest flex items-center gap-1">
            <IconEye size={16} /> Game Master
          </div>
        )}
        {!isNarration && !isAssistant && (
          <div className="text-xs text-accent-fg/70 mb-2 font-semibold uppercase tracking-widest flex items-center gap-1">
            <IconUser size={16} /> {characterName ?? 'You'}
          </div>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
        {isStreaming && isAssistant && (
          <span className="inline-flex gap-1 mt-2">
            <span className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
          </span>
        )}
      </div>
    </div>
  )
}
