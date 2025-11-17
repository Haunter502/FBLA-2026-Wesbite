'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, Users, MessageSquare, Plus, X, BookOpen, CheckCircle2 } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Create Group Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your Study Groups
              </CardTitle>
              <CardDescription>Create or join study groups to collaborate with peers</CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showCreateGroup ? 'Cancel' : 'Create Group'}
            </Button>
          </div>
        </CardHeader>
        {showCreateGroup && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name *</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., Algebra Study Group"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="What will this group focus on?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Members</label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors ${
                      selectedStudents.includes(student.id) ? 'bg-primary/10 border border-primary' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{student.name || 'Student'}</div>
                      <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                    </div>
                    {selectedStudents.includes(student.id) && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={handleCreateGroup}
              disabled={creating || !newGroupName.trim()}
              className="w-full bg-gradient-to-r from-primary to-primary/80"
            >
              {creating ? 'Creating...' : 'Create Group'}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Existing Groups */}
      {userGroups.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userGroups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{group.name}</span>
                      {group.role === 'ADMIN' && (
                        <Badge variant="default" className="text-xs">Admin</Badge>
                      )}
                    </CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link href={`/groups/${group.id}`}>
                      <Button className="w-full" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Open Chat
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Students List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Find Study Partners</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No students found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={student.image || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{student.name || 'Student'}</div>
                        <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                        {student.bio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {student.bio}
                          </p>
                        )}
                        {student.unitProgress.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Completed Units:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {student.unitProgress.slice(0, 3).map((unit) => (
                                <Badge key={unit.id} variant="secondary" className="text-xs">
                                  {unit.title}
                                </Badge>
                              ))}
                              {student.unitProgress.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{student.unitProgress.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


