'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Send, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/group-study">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Group Study
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{group.name}</h1>
        {group.description && <p className="text-muted-foreground mt-2">{group.description}</p>}
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <span>Group Chat</span>
            <span className="text-sm font-normal text-muted-foreground">
              ({group.members.length} members)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div
            id="messages-container"
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.user.id === currentUserId
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.user.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(message.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {isOwn ? 'You' : message.user.name || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {message.message}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


