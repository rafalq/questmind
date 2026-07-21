import { genreFont } from '@/lib/genre-theme'
import type { Genre } from '@/worlds/'
import { IconEye, IconUser } from '@tabler/icons-react'
import { SnapshotChange } from '../lib/snapshot-diff'
import SnapshotDelta from './snapshot-delta'

type Props = {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  isNarration?: boolean
  characterName?: string
  genre: Genre
  changes?: SnapshotChange[]
}

export default function MessageBubble({
  role,
  content,
  isStreaming,
  isNarration,
  characterName,
  genre,
  changes,
}: Props) {
  const isAssistant = role === 'assistant'

  return (
    <div
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} ${isNarration ? 'mb-8' : 'my-10'}`}
      style={{ fontFamily: genreFont[genre] }}
    >
      <div
        className={
          isNarration
            ? 'w-full text-base leading-loose text-text-secondary'
            : `max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                isAssistant
                  ? 'bg-surface border border-border text-text-primary'
                  : 'bg-accent text-accent-fg'
              }`
        }
      >
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
        <div>{renderContent(content)}</div>
        {changes && changes.length > 0 && <SnapshotDelta changes={changes} />}
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

// Inline emphasis for a single paragraph. Handles the small allowed set —
// **bold** / __bold__ and *italic* / _italic_ — non-nested, which is all GM
// narration ever produces. Bold alternatives are listed before italic so the
// tokenizer consumes "**x**" whole instead of leaving stray outer asterisks
// (the bug in the previous single-asterisk regex). Anything that isn't a
// closed emphasis pair falls through as plain text, so a half-typed "*word"
// mid-stream renders literally until its closing marker arrives.
function renderInline(text: string) {
  const tokenRe = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g
  const parts = text.split(tokenRe)

  return parts.map((part, j) => {
    if (!part) return null
    if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      return <strong key={j}>{part.slice(2, -2)}</strong>
    }
    if (
      (part.startsWith('*') && part.endsWith('*')) ||
      (part.startsWith('_') && part.endsWith('_'))
    ) {
      return <em key={j}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

// The contract: GM output uses blank-line paragraph breaks, "# " headings
// (the opening title), inline emphasis, and a lone "---" scene break. No
// general markdown parser: tables, blockquotes, links, images and lists never
// legitimately appear, so parsing them would be dead weight on output we
// control at both ends.
function renderContent(content: string) {
  const paragraphs = content.split(/\n{2,}/)

  return paragraphs.map((para, i) => {
    let line = para.trim()
    if (!line) return null

    // Scene break — a paragraph that is only a horizontal-rule marker.
    if (line === '---' || line === '***' || line === '___') {
      return (
        <p key={i} className="text-center text-accent my-4 tracking-widest">
          ❧ ❧ ❧
        </p>
      )
    }

    // Heading — render distinctly (bold, larger, accent) instead of as body
    // text. Level maps to size: # is the opening title, ## / ### step down.
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      const sizeClass =
        level === 1
          ? 'text-xl text-center'
          : level === 2
            ? 'text-base'
            : 'text-sm'
      return (
        <p key={i} className={`font-bold text-accent mb-3 ${sizeClass}`}>
          {renderInline(heading[2])}
        </p>
      )
    }

    return (
      <p key={i} className="mb-3">
        {renderInline(line)}
      </p>
    )
  })
}
