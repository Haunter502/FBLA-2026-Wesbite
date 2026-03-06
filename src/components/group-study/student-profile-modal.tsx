'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, MessageSquare, User, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Student {
  id: string
  name: string | null
  email: string
  image: string | null
  bio: string | null
  unitProgress: { id: string; title: string }[]
  inProgressUnits?: { id: string; title: string }[]
}

interface StudentProfileModalProps {
  student: Student | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
}

export function StudentProfileModal({ student, open, onOpenChange, currentUserId }: StudentProfileModalProps) {
  const router = useRouter()

  if (!student) return null

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleStartChat = () => {
    onOpenChange(false)
    router.push(`/messages/${student.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-full blur-lg animate-pulse" />
              <Avatar className="relative h-16 w-16 ring-4 ring-primary/30 shadow-lg shadow-primary/20">
                <AvatarImage src={student.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div>{student.name || 'Student'}</div>
              <div className="text-sm font-normal text-muted-foreground">{student.email}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            View profile and start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Bio Section */}
          {student.bio && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-background border border-primary/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">About</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{student.bio}</p>
            </motion.div>
          )}

          {/* In Progress Units */}
          {student.inProgressUnits && student.inProgressUnits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Units In Progress</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {student.inProgressUnits.map((unit) => (
                  <Badge
                    key={unit.id}
                    variant="secondary"
                    className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  >
                    {unit.title}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Completed Units */}
          {student.unitProgress.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Completed Units</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {student.unitProgress.map((unit) => (
                  <Badge
                    key={unit.id}
                    variant="secondary"
                    className="bg-green-500/10 text-green-600 border-green-500/20"
                  >
                    {unit.title}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 pt-4 border-t"
          >
            <Button
              onClick={handleStartChat}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = `mailto:${student.email}`}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

