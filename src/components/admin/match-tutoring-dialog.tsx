'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Calendar, Clock, Mail } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Teacher {
  id: string
  name: string
  email: string
  bio: string
  officeHours: string | null
}

interface Slot {
  id: string
  teacherId: string
  start: number
  end: number
  capacity: number
  spotsLeft: number
  teacher: {
    name: string
    email: string
  }
}

interface MatchTutoringDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  onMatchSuccess: () => void
}

export function MatchTutoringDialog({
  open,
  onOpenChange,
  requestId,
  onMatchSuccess,
}: MatchTutoringDialogProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [matchType, setMatchType] = useState<'teacher' | 'slot'>('teacher')

  useEffect(() => {
    if (open) {
      fetchData()
    } else {
      // Reset state when dialog closes
      setSelectedTeacherId(null)
      setSelectedSlotId(null)
      setMatchType('teacher')
    }
  }, [open])

  async function fetchData() {
    setFetching(true)
    try {
      const [teachersRes, slotsRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/tutoring/slots'),
      ])

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData.teachers || [])
      }

      if (slotsRes.ok) {
        const slotsData = await slotsRes.json()
        setSlots(slotsData.slots || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetching(false)
    }
  }

  async function handleMatch() {
    if (!selectedTeacherId && !selectedSlotId) {
      alert('Please select a teacher or a time slot')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/tutoring/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          teacherId: selectedTeacherId || undefined,
          slotId: selectedSlotId || undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to match')
      }

      onMatchSuccess()
      onOpenChange(false)
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      console.error('Error matching:', error)
      alert(error.message || 'Failed to create match. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Match Student to Tutoring Session</DialogTitle>
          <DialogDescription>
            Select a teacher or available time slot to match this student with.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={matchType} onValueChange={(v) => setMatchType(v as 'teacher' | 'slot')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teacher">Match to Teacher</TabsTrigger>
                <TabsTrigger value="slot">Match to Time Slot</TabsTrigger>
              </TabsList>

              <TabsContent value="teacher" className="space-y-3 mt-4">
                {teachers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No teachers available
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {teachers.map((teacher) => (
                      <button
                        key={teacher.id}
                        onClick={() => {
                          setSelectedTeacherId(teacher.id)
                          setSelectedSlotId(null)
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedTeacherId === teacher.id
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{teacher.name}</span>
                              {selectedTeacherId === teacher.id && (
                                <Badge variant="default">Selected</Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                {teacher.email}
                              </div>
                              {teacher.officeHours && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {teacher.officeHours}
                                </div>
                              )}
                              {teacher.bio && (
                                <p className="text-xs mt-2">{teacher.bio}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="slot" className="space-y-3 mt-4">
                {slots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No available time slots
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => {
                          setSelectedSlotId(slot.id)
                          setSelectedTeacherId(null)
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedSlotId === slot.id
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{slot.teacher.name}</span>
                              {selectedSlotId === slot.id && (
                                <Badge variant="default">Selected</Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {new Date(slot.start * 1000).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {new Date(slot.start * 1000).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}{' '}
                                -{' '}
                                {new Date(slot.end * 1000).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div className="text-xs">
                                {slot.spotsLeft} of {slot.capacity} spots available
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMatch}
                disabled={loading || (!selectedTeacherId && !selectedSlotId)}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Matching...
                  </>
                ) : (
                  'Create Match'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

