'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, Users, MessageSquare, Plus, X, BookOpen, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children'

interface Student {
  id: string
  name: string | null
  email: string
  image: string | null
  bio: string | null
  unitProgress: { id: string; title: string }[]
}

interface Group {
  id: string
  name: string
  description: string | null
  createdAt: number | Date
  role: string
}

interface GroupStudyClientProps {
  students: Student[]
  userGroups: Group[]
  currentUserId: string
}

export function GroupStudyClient({ students, userGroups, currentUserId }: GroupStudyClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  const filteredStudents = students.filter((student) => {
    if (student.id === currentUserId) return false
    const query = searchQuery.toLowerCase()
    return (
      student.name?.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.bio?.toLowerCase().includes(query)
    )
  })

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription || null,
          memberIds: selectedStudents,
        }),
      })

      if (response.ok) {
        router.refresh()
        setShowCreateGroup(false)
        setNewGroupName('')
        setNewGroupDescription('')
        setSelectedStudents([])
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      alert('Failed to create group. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    )
  }

  return (
    <div className="space-y-8">
      {/* Create Group Section */}
      <ScrollReveal delay={0.2}>
        <GlowEffect intensity="low">
          <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background/90 to-background border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="p-2 rounded-lg bg-primary/10"
                    >
                      <Users className="h-6 w-6 text-primary" />
                    </motion.div>
                    Your Study Groups
                  </CardTitle>
                  <CardDescription className="mt-2">Create or join study groups to collaborate with peers</CardDescription>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setShowCreateGroup(!showCreateGroup)}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {showCreateGroup ? 'Cancel' : 'Create Group'}
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <AnimatePresence>
              {showCreateGroup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Group Name *</label>
                      <Input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g., Algebra Study Group"
                        className="border-primary/30 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description (optional)</label>
                      <Input
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        placeholder="What will this group focus on?"
                        className="border-primary/30 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Members</label>
                      <div className="max-h-40 overflow-y-auto space-y-2 border-2 border-primary/20 rounded-lg p-3 bg-background/50 backdrop-blur-sm">
                        {filteredStudents.map((student, index) => (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleStudentSelection(student.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedStudents.includes(student.id)
                                ? 'bg-primary/20 border-2 border-primary shadow-md shadow-primary/20'
                                : 'hover:bg-primary/5 border-2 border-transparent hover:border-primary/20'
                            }`}
                          >
                            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                              <AvatarImage src={student.image || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                {getInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{student.name || 'Student'}</div>
                              <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                            </div>
                            <AnimatePresence>
                              {selectedStudents.includes(student.id) && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 180 }}
                                >
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleCreateGroup}
                        disabled={creating || !newGroupName.trim()}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
                      >
                        {creating ? 'Creating...' : 'Create Group'}
                      </Button>
                    </motion.div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </GlowEffect>
      </ScrollReveal>

      {/* Existing Groups */}
      {userGroups.length > 0 && (
        <ScrollReveal delay={0.3}>
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-primary" />
              Your Groups
            </h2>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
              {userGroups.map((group, index) => (
                <StaggerItem key={group.id}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <GlowEffect intensity="medium">
                      <GlassCard className="h-full backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background/90 to-background border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between text-lg">
                            <span className="font-bold">{group.name}</span>
                            {group.role === 'ADMIN' && (
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Badge variant="default" className="text-xs bg-primary/20 text-primary border-primary/30">
                                  Admin
                                </Badge>
                              </motion.div>
                            )}
                          </CardTitle>
                          {group.description && (
                            <CardDescription className="mt-2">{group.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <Link href={`/groups/${group.id}`}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md shadow-primary/20" variant="default">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Open Chat
                              </Button>
                            </motion.div>
                          </Link>
                        </CardContent>
                      </GlassCard>
                    </GlowEffect>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </ScrollReveal>
      )}

      {/* Students List */}
      <ScrollReveal delay={0.4}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              Find Study Partners
            </h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-64"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/60" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="pl-10 border-primary/30 focus:border-primary focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {filteredStudents.length === 0 ? (
            <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-muted/10 via-background/90 to-background border-2 border-muted/30">
              <CardContent className="py-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">No students found</p>
                </motion.div>
              </CardContent>
            </GlassCard>
          ) : (
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.05}>
              {filteredStudents.map((student, index) => (
                <StaggerItem key={student.id}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <GlowEffect intensity="low">
                      <GlassCard className="h-full backdrop-blur-xl bg-gradient-to-br from-primary/5 via-background/90 to-background border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <Avatar className="h-14 w-14 ring-2 ring-primary/30 shadow-lg shadow-primary/20">
                                <AvatarImage src={student.image || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                                  {getInitials(student.name)}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-lg mb-1">{student.name || 'Student'}</div>
                              <div className="text-xs text-muted-foreground truncate mb-2">{student.email}</div>
                              {student.bio && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                  {student.bio}
                                </p>
                              )}
                              {student.unitProgress.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                                    Completed Units:
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {student.unitProgress.slice(0, 3).map((unit) => (
                                      <motion.div
                                        key={unit.id}
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                          {unit.title}
                                        </Badge>
                                      </motion.div>
                                    ))}
                                    {student.unitProgress.length > 3 && (
                                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                        +{student.unitProgress.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </GlassCard>
                    </GlowEffect>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </div>
      </ScrollReveal>
    </div>
  )
}


