'use client'

import { useEffect, useRef, useState } from 'react'
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

export default function ChatPanel({ messages, isStreaming, onSend }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
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
            isStreaming={
              isStreaming && i === messages.length - 1 && m.role === 'assistant'
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex gap-3 items-end">
          <textarea
            className="flex-1 bg-surface border border-border text-text-primary placeholder:text-text-muted px-4 py-3 text-sm resize-none focus:outline-none focus:border-accent transition-colors"
            placeholder="What do you do? (Enter to send, Shift+Enter for new line)"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
          />
          <Button
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
