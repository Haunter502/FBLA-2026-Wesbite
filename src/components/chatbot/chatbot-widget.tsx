'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi, I’m your πumera tutor! Ask me anything about this site, πumera itself, or any math problem you’re working on.",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          pagePath: pathname,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      const data = (await res.json()) as { reply: string }

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: data.reply,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach the πumera tutor right now. Please try again later.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const hasUnread = !isOpen && messages.length > 1

  const contextSubtitle =
    pathname?.startsWith('/tutoring')
      ? 'Need help picking a tutor or time?'
      : pathname?.startsWith('/units')
        ? 'Stuck on a unit? Ask me about it.'
        : 'Ask about πumera, this page, or any math problem.'

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Chat panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, x: 32, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, y: 16, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 max-h-[70vh] rounded-2xl border border-border/70 bg-gradient-to-b from-background/95 via-background/98 to-background shadow-brand-lg flex flex-col overflow-hidden backdrop-blur-sm"
              aria-label="πumera tutor chat"
            >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand shadow-brand">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    className="text-xl font-bold inline-block"
                  >
                    π
                  </motion.span>
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground border border-primary">
                    √
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">
                    πumera Tutor
                  </span>
                  <span className="text-[11px] opacity-80">
                    {contextSubtitle}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-1 hover:bg-primary/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-muted/40">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card text-foreground border border-border/60 rounded-bl-sm'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-6 w-10 rounded-full bg-card border border-border/60 flex items-center justify-center">
                    <span className="animate-pulse-slow">•••</span>
                  </div>
                  <span>Thinking...</span>
                </div>
              )}

              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-2 py-1">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input + suggestion chips */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-border bg-card px-3 py-2 flex flex-col gap-2"
            >
              {/* One-click suggestion chips */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setInput((prev) =>
                      prev
                        ? `${prev.trim()} Explain this concept step by step.`
                        : 'Explain this concept step by step.'
                    )
                  }
                  className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Explain this concept
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInput((prev) =>
                      prev
                        ? `${prev.trim()} Help me with this homework problem.`
                        : 'Help me with this homework problem.'
                    )
                  }
                  className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Help with a homework problem
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInput((prev) =>
                      prev
                        ? `${prev.trim()} Where do I find this on πumera?`
                        : 'Where do I find this on πumera?'
                    )
                  }
                  className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Where do I find this on πumera?
                </button>
              </div>

              <div className="flex gap-2 items-end">
                <textarea
                  className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-h-28"
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void handleSubmit(e)
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    'inline-flex items-center justify-center rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-brand hover:shadow-brand-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Ask
                </button>
              </div>
            </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'group absolute bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-white shadow-brand-lg hover:shadow-brand transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            !isOpen && 'animate-pulse-glow'
          )}
          whileHover={{ scale: 1.12, rotate: -4, y: -2 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isOpen ? 'Close πumera tutor chat' : 'Open πumera tutor chat'}
        >
          {/* Tooltip */}
          <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium text-foreground shadow-brand border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Ask πumera
          </div>

          {/* Blur-glow border (shows on hover) */}
          <div className="pointer-events-none absolute -inset-1 rounded-full bg-primary/35 blur-md opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />

          {/* πumera logo (glass capsule) */}
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white font-bold border border-white/25 shadow-brand transition-transform duration-200 group-hover:scale-[1.06] group-hover:-rotate-6">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="text-2xl leading-none drop-shadow-sm inline-block"
            >
              π
            </motion.span>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/80 text-primary-foreground text-[10px] font-semibold border border-white/60" />
          </div>

          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent animate-pulse-slow" />
          )}

          <span className="sr-only">
            {isOpen ? 'Close πumera tutor chat' : 'Open πumera tutor chat'}
          </span>
        </motion.button>
      </div>
    </div>
  )
}

