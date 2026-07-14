'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import MessageBubble from './message-bubble'
import Button from '@/components/ui/button'
import { genreFont, genreBg } from '@/lib/genre-theme'
import { Genre } from '@/worlds/'
import { IconArrowNarrowDownDashed, IconSend } from '@tabler/icons-react'
import { diffSnapshots } from '../lib/snapshot-diff'
import { UIMessage } from '../lib/types'

type Props = {
  messages: UIMessage[]
  isStreaming: boolean
  onSend: (message: string) => void
  genre: Genre
  characterName: string
}

const SCROLL_THRESHOLD = 100
const MAX_INPUT_HEIGHT = 200

export type ChatPanelHandle = {
  insertAbility: (name: string) => void
}

const ChatPanel = forwardRef<ChatPanelHandle, Props>(function ChatPanel(
  { messages, isStreaming, onSend, genre, characterName },
  ref
) {
  const [input, setInput] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Scroll helpers ───────────────────────────────────────────────────────

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }, [])

  // ── Track scroll position ────────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD
    isAtBottomRef.current = atBottom
    setIsAtBottom(atBottom)
  }, [])

  // ── Auto-scroll on new content ───────────────────────────────────────────
  // Only scrolls if the user is already near the bottom.

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom('smooth')
    }
  }, [messages, scrollToBottom])

  // Auto-grow: reset to 'auto' first so the element can shrink back when the
  // player deletes lines, then match scrollHeight up to a ceiling.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`
  }, [input])

  // Called by the stats panel when an ability is clicked. Imperative rather
  // than a prop + effect: this is an event, not state to synchronise.
  useImperativeHandle(ref, () => ({
    insertAbility: (name: string) => {
      setInput((prev) => (prev ? `${prev} ` : '') + `${name} — `)
      textareaRef.current?.focus()
    },
  }))

  // ── Send handlers ────────────────────────────────────────────────────────

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setInput('')
    // Always follow scroll when player sends
    isAtBottomRef.current = true
    setIsAtBottom(true)
    scrollToBottom('smooth')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="flex flex-col flex-1 min-h-0 relative"
      style={{
        fontFamily: genreFont[genre],
        backgroundColor: genreBg[genre],
      }}
    >
      {/* Message list */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-8 scrollbar-subtle"
      >
        {/* Shared column: narration and player turns sit on the same axis,
            so collapsing the stats panel adds margin, not sprawl. */}
        <div className="mx-auto w-full max-w-[68ch]">
          {messages.length === 0 && (
            <p className="text-center text-text-muted text-sm mt-12">
              Your adventure begins. What do you do?
            </p>
          )}
          {messages.map((m, i) => {
            // Previous snapshot = the most recent one before this message.
            const prevSnapshot =
              messages
                .slice(0, i)
                .reverse()
                .find((prev) => prev.snapshot)?.snapshot ?? null

            return (
              <MessageBubble
                key={i}
                role={m.role}
                content={m.content}
                genre={genre}
                isNarration={m.role === 'assistant'}
                isStreaming={
                  isStreaming &&
                  i === messages.length - 1 &&
                  m.role === 'assistant'
                }
                characterName={m.role === 'user' ? characterName : undefined}
                changes={diffSnapshots(prevSnapshot, m.snapshot ?? null)}
              />
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Jump to bottom button */}
      {!isAtBottom && (
        <button
          onClick={() => {
            scrollToBottom('smooth')
            isAtBottomRef.current = true
            setIsAtBottom(true)
          }}
          className="absolute bottom-24 right-1/2 flex items-center gap-2 p-1 text-xs bg-bg-surface border border-accent text-text-primary hover:bg-bg-elevated hover:border-accent-hover transition-colors rounded-full"
          aria-label="Jump to bottom"
        >
          <IconArrowNarrowDownDashed stroke={2} color="#c9a84c" />
        </button>
      )}

      {/* Input area */}
      <div className="border-t border-border px-6 py-4">
        <div className="mx-auto w-full max-w-[68ch] flex gap-3 items-stretch">
          <textarea
            ref={textareaRef}
            className="flex-1 bg-bg-surface border border-border text-text-primary placeholder:text-text-muted px-4 py-3 text-sm resize-none overflow-y-auto focus:outline-none focus:border-accent transition-colors scrollbar-subtle"
            placeholder="What do you do? (Enter to send, Shift+Enter for new line)"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
          />
          <Button
            variant="outline"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            loading={isStreaming}
            loadingText="..."
            className="self-end shrink-0 py-4.5 px-8"
            aria-label="Send action"
            title="Send (Enter)"
          >
            <IconSend stroke={2} />
          </Button>
        </div>
      </div>
    </div>
  )
})

export default ChatPanel
