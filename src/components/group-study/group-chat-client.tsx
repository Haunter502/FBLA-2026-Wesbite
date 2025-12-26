'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Send, ArrowLeft, Users, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ParticleBackground } from '@/components/animations/particle-background'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { FadeInUp } from '@/components/animations/fade-in-up'

interface Group {
  id: string
  name: string
  description: string | null
  createdAt: number
  members: {
    id: string
    name: string | null
    email: string
    image: string | null
  }[]
}

interface Message {
  id: string
  message: string
  createdAt: number
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface GroupChatClientProps {
  group: Group
  currentUserId: string
}

export function GroupChatClient({ group, currentUserId }: GroupChatClientProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/groups/${group.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [group.id])

  // Auto-scroll logic - only scroll if user is near bottom
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50
      
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/groups/${group.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })

      if (response.ok) {
        setNewMessage('')
        await fetchMessages()
        // Scroll to bottom after sending
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        alert('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: number | Date) => {
    try {
      let date: Date
      if (typeof timestamp === 'number') {
        // If it's a Unix timestamp in seconds, convert to milliseconds
        date = timestamp < 10000000000 ? new Date(timestamp * 1000) : new Date(timestamp)
      } else {
        date = new Date(timestamp)
      }

      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }

      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / 60000)

      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced Background */}
      <ParticleBackground count={25} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header Section */}
        <FadeInUp delay={0.1}>
          <div className="mb-6">
            <Link href="/group-study">
              <Button variant="ghost" size="sm" className="mb-4 hover:bg-primary/10 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Group Study
              </Button>
            </Link>
            <GlowEffect intensity="medium">
              <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background/90 to-background border-2 border-primary/30 p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {group.name}
                    </h1>
                    {group.description && (
                      <p className="text-muted-foreground text-lg">{group.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </GlowEffect>
          </div>
        </FadeInUp>

        {/* Chat Container */}
        <GlowEffect intensity="low">
          <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-primary/5 via-background/95 to-background border-2 border-primary/20 h-[700px] flex flex-col shadow-2xl">
            {/* Chat Header */}
            <div className="border-b border-primary/20 p-4 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Group Chat</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div
              id="messages-container"
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background/50 to-background custom-scrollbar"
            >
              <AnimatePresence>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center h-full"
                  >
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-primary/50" />
                      </div>
                      <p className="text-muted-foreground text-lg">No messages yet</p>
                      <p className="text-sm text-muted-foreground/70 mt-2">Start the conversation!</p>
                    </div>
                  </motion.div>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = message.user.id === currentUserId
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {!isOwn && (
                          <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/20">
                            <AvatarImage src={message.user.image || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                              {getInitials(message.user.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          <div className={`flex items-center gap-2 mb-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-sm font-semibold">
                              {isOwn ? 'You' : message.user.name || 'User'}
                            </span>
                            <span className="text-xs text-muted-foreground/70">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`relative px-5 py-3 rounded-2xl break-words shadow-lg transition-shadow ${
                              isOwn
                                ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-sm'
                                : 'bg-gradient-to-br from-muted to-muted/80 text-foreground rounded-bl-sm border border-primary/10'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                          </motion.div>
                        </div>
                        {isOwn && (
                          <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/30">
                            <AvatarImage src={message.user.image || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/20 text-primary-foreground font-semibold">
                              {getInitials(message.user.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-primary/20 p-4 bg-gradient-to-r from-background/95 to-background backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full pr-12 border-primary/30 focus:border-primary focus:ring-primary/20 bg-background/80 backdrop-blur-sm h-12 text-base"
                    disabled={sending}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="h-12 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {sending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Send className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </GlassCard>
        </GlowEffect>
      </div>
    </div>
  )
}


