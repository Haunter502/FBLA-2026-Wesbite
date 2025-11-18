'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquare, Calendar, Users, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'direct_message' | 'tutoring_request' | 'group_message'
  title: string
  message: string
  createdAt: number
  link: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'direct_message':
        return <MessageSquare className="h-4 w-4 text-primary" />
      case 'tutoring_request':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'group_message':
        return <Users className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const handleNotificationClick = (link: string) => {
    setOpen(false)
    router.push(link)
    router.refresh()
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={bellRef}
            variant="ghost"
            size="default"
            className="relative h-10 w-10 p-0"
          >
            <motion.div
              animate={unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 2 }}
            >
              <Bell className="h-6 w-6 text-foreground" />
            </motion.div>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
              >
                <span className="text-xs font-bold text-primary-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </motion.div>
            )}
          </Button>
        </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationClick(notification.link)}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold">{notification.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Link
              href="/group-study"
              className="text-xs text-primary hover:underline text-center block"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

