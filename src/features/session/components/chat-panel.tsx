'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import MessageBubble from './message-bubble'
import Button from '@/components/ui/button'

type UIMessage = {
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  messages: UIMessage[]
  isStreaming: boolean
  onSend: (message: string) => void
}

const SCROLL_THRESHOLD = 100

export default function ChatPanel({ messages, isStreaming, onSend }: Props) {
  const [input, setInput] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

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
    <div className="flex flex-col flex-1 min-h-0 relative">
      {/* Message list */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        {messages.length === 0 && (
          <p className="text-center text-text-muted text-sm mt-12">
            Your adventure begins. What do you do?
          </p>
        )}
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            role={m.role}
            content={m.content}
            isNarration={i === 0 && m.role === 'assistant'}
            isStreaming={
              isStreaming && i === messages.length - 1 && m.role === 'assistant'
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Jump to bottom button */}
      {!isAtBottom && (
        <button
          onClick={() => {
            scrollToBottom('smooth')
            isAtBottomRef.current = true
            setIsAtBottom(true)
          }}
          className="absolute bottom-24 right-6 flex items-center gap-2 px-3 py-2 text-xs bg-bg-surface border border-accent text-text-primary hover:bg-bg-elevated hover:border-accent-hover transition-colors"
          aria-label="Jump to bottom"
        >
          ↓ Latest
        </button>
      )}

      {/* Input area */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex gap-3 items-end">
          <textarea
            className="flex-1 bg-bg-surface border border-border text-text-primary placeholder:text-text-muted px-4 py-3 text-sm resize-none focus:outline-none focus:border-accent transition-colors"
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
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
