'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, HelpCircle, Mail, Clock, User, CheckCircle2, TrendingUp, BookOpen, Calendar, Loader2 } from "lucide-react"
import { useRouter } from 'next/navigation'

interface TutoringRequest {
  id: string
  type: string
  topic: string | null
  status: string
  createdAt: number | null
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  responded: boolean
  createdAt: number | null
}

interface AdminSubmissionsClientProps {
  tutoringRequests: TutoringRequest[]
  contactSubmissions: ContactSubmission[]
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return 'Unknown date'
  const date = new Date(timestamp)
  // Use a consistent format that works the same on server and client
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${month} ${day}, ${year} at ${displayHours}:${minutes} ${ampm}`
}

interface ProgressSummary {
  overallProgress: number
  overallGrade: number | null
  currentUnit: {
    id: string
    title: string
    slug: string
    progress: {
      totalLessons: number
      completedLessons: number
      percentage: number
      grade: number | null
    }
  } | null
  nextLesson: {
    id: string
    title: string
    slug: string
    unitTitle: string
    unitSlug: string
  } | null
  upcomingSessions: Array<{
    id: string
    topic: string | null
    status: string
    startTime: number | null
    endTime: number | null
  }>
}

export function AdminSubmissionsClient({ 
  tutoringRequests, 
  contactSubmissions 
}: AdminSubmissionsClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [progressSummaries, setProgressSummaries] = useState<Record<string, ProgressSummary | null>>({})
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({})

  const immediateRequests = tutoringRequests.filter(r => r.type === 'IMMEDIATE')
  const scheduledRequests = tutoringRequests.filter(r => r.type === 'SCHEDULED')
  const unreadContacts = contactSubmissions.filter(c => !c.read)
  const unreadRequests = tutoringRequests.filter(r => r.status === 'PENDING')

  const fetchProgressSummary = async (userId: string, requestId: string) => {
    if (loadingSummaries[requestId] || progressSummaries[requestId] !== undefined) {
      return // Already loading or loaded
    }

    setLoadingSummaries(prev => ({ ...prev, [requestId]: true }))
    try {
      const response = await fetch(`/api/students/${userId}/progress-summary`)
      if (response.ok) {
        const summary = await response.json()
        setProgressSummaries(prev => ({ ...prev, [requestId]: summary }))
      } else {
        setProgressSummaries(prev => ({ ...prev, [requestId]: null }))
      }
    } catch (error) {
      console.error('Error fetching progress summary:', error)
      setProgressSummaries(prev => ({ ...prev, [requestId]: null }))
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [requestId]: false }))
    }
  }

  // Auto-fetch progress summaries for immediate requests that don't have them
  useEffect(() => {
    immediateRequests.forEach((request) => {
      if (request.user && !request.topic?.includes('[PROGRESS_SUMMARY]')) {
        // Only fetch if we haven't already tried
        if (progressSummaries[request.id] === undefined && !loadingSummaries[request.id]) {
          fetchProgressSummary(request.user.id, request.id)
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const handleMarkContactRead = async (id: string) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/contacts/${id}/read`, {
        method: 'PATCH',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error marking contact as read:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleMarkContactResponded = async (id: string) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/contacts/${id}/responded`, {
        method: 'PATCH',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error marking contact as responded:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleUpdateRequestStatus = async (id: string, status: 'MATCHED' | 'COMPLETED') => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/tutoring/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating request status:', error)
    } finally {
      setLoading(null)
    }
  }


  return (
    <Tabs defaultValue="immediate" className="space-y-4">
      <TabsList>
        <TabsTrigger value="immediate">
          <HelpCircle className="h-4 w-4 mr-2" />
          Immediate Help ({immediateRequests.length})
          {unreadRequests.filter(r => r.type === 'IMMEDIATE').length > 0 && (
            <Badge className="ml-2" variant="destructive">
              {unreadRequests.filter(r => r.type === 'IMMEDIATE').length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="scheduled">
          Scheduled ({scheduledRequests.length})
        </TabsTrigger>
        <TabsTrigger value="contacts">
          <Mail className="h-4 w-4 mr-2" />
          Contact Forms ({contactSubmissions.length})
          {unreadContacts.length > 0 && (
            <Badge className="ml-2" variant="destructive">
              {unreadContacts.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="immediate" className="space-y-4">
        {immediateRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No immediate help requests yet
              </div>
            </CardContent>
          </Card>
        ) : (
          immediateRequests.map((request) => (
            <Card key={request.id} className={request.status === 'PENDING' ? 'border-orange-500/50 bg-orange-500/5' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">Immediate Help Request</CardTitle>
                      <Badge
                        variant={
                          request.status === 'PENDING'
                            ? 'destructive'
                            : request.status === 'MATCHED'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Topic: {request.topic?.split('\n\n[PROGRESS_SUMMARY]')[0] || 'No topic specified'}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.user && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{request.user.name || 'Unknown'}</span>
                      <span className="text-muted-foreground">({request.user.email})</span>
                    </div>
                  )}

                  {/* Progress Summary - Always show for immediate requests */}
                  {(() => {
                    let summary: ProgressSummary | null = null
                    
                    // Try to parse from topic field first
                    if (request.topic?.includes('[PROGRESS_SUMMARY]')) {
                      try {
                        const summaryJson = request.topic.split('[PROGRESS_SUMMARY]\n')[1]
                        summary = JSON.parse(summaryJson)
                      } catch (e) {
                        console.error('Error parsing progress summary:', e)
                      }
                    }
                    
                    // If not in topic and we have a user, fetch it
                    if (!summary && request.user) {
                      const requestSummary = progressSummaries[request.id]
                      const isLoading = loadingSummaries[request.id]
                      
                      if (requestSummary !== undefined) {
                        summary = requestSummary
                      } else if (!isLoading) {
                        // Fetch on first render
                        fetchProgressSummary(request.user.id, request.id)
                      }
                    }

                    if (summary) {
                      return (
                        <div className="mt-4 p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-lg border-2 border-primary/30 shadow-lg">
                          <h4 className="font-bold text-base mb-4 flex items-center gap-2 text-primary">
                            <TrendingUp className="h-5 w-5" />
                            Student Progress Summary
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                                <span className="text-muted-foreground font-medium">Overall Progress:</span>
                                <span className="font-bold text-lg text-primary">{summary.overallProgress}%</span>
                              </div>
                              {summary.overallGrade !== null && (
                                <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                                  <span className="text-muted-foreground font-medium">Overall Grade:</span>
                                  <span className="font-bold text-lg text-primary">{summary.overallGrade}%</span>
                                </div>
                              )}
                            </div>
                            {summary.currentUnit && (
                              <div className="space-y-2 p-3 bg-background/50 rounded border border-primary/10">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-2 font-medium">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    Current Unit:
                                  </span>
                                  <span className="font-bold text-primary">{summary.currentUnit.title}</span>
                                </div>
                                <div className="ml-6 text-xs text-muted-foreground space-y-1">
                                  <div>
                                    <span className="font-semibold">{summary.currentUnit.progress.completedLessons}</span> / <span className="font-semibold">{summary.currentUnit.progress.totalLessons}</span> lessons completed
                                  </div>
                                  {summary.currentUnit.progress.grade && (
                                    <div className="text-primary font-semibold">
                                      Unit Grade: {summary.currentUnit.progress.grade}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {summary.nextLesson && (
                              <div className="flex items-center justify-between p-3 bg-background/50 rounded border border-primary/10">
                                <span className="text-muted-foreground font-medium">Next Recommended Lesson:</span>
                                <span className="font-bold text-primary text-right max-w-[60%] truncate">
                                  {summary.nextLesson.title}
                                </span>
                              </div>
                            )}
                            {summary.upcomingSessions && summary.upcomingSessions.length > 0 && (
                              <div className="p-3 bg-background/50 rounded border border-primary/10">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span>Upcoming Tutoring Sessions:</span>
                                </div>
                                <div className="ml-6 space-y-1">
                                  {summary.upcomingSessions.slice(0, 3).map((session: any, idx: number) => (
                                    <div key={idx} className="text-xs">
                                      {session.startTime ? (
                                        <span className="font-semibold">{new Date(session.startTime * 1000).toLocaleString()}</span>
                                      ) : (
                                        <span className="text-muted-foreground">Pending scheduling</span>
                                      )}
                                      {session.topic && (
                                        <span className="text-muted-foreground"> • {session.topic}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }
                    
                    // Show loading or fetch button
                    const isLoading = loadingSummaries[request.id]
                    const hasTriedFetch = progressSummaries[request.id] !== undefined
                    
                    return (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Student Progress Summary</span>
                          </div>
                          {!hasTriedFetch && request.user && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchProgressSummary(request.user!.id, request.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                'Load Progress'
                              )}
                            </Button>
                          )}
                        </div>
                        {isLoading ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Loading progress summary...</span>
                          </div>
                        ) : hasTriedFetch && !summary ? (
                          <p className="text-xs text-muted-foreground">
                            Unable to load progress summary. The student may not have any progress recorded yet.
                          </p>
                        ) : !hasTriedFetch ? (
                          <p className="text-xs text-muted-foreground">
                            Click "Load Progress" to view the student's current progress information.
                          </p>
                        ) : null}
                      </div>
                    )
                  })()}
                  <div className="flex gap-2 pt-2">
                    {request.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRequestStatus(request.id, 'MATCHED')}
                        disabled={loading === request.id}
                      >
                        Mark as Matched
                      </Button>
                    )}
                    {request.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRequestStatus(request.id, 'COMPLETED')}
                        disabled={loading === request.id}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="scheduled" className="space-y-4">
        {scheduledRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No scheduled tutoring requests yet
              </div>
            </CardContent>
          </Card>
        ) : (
          scheduledRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">Scheduled Session</CardTitle>
                      <Badge
                        variant={
                          request.status === 'PENDING'
                            ? 'destructive'
                            : request.status === 'MATCHED'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    {request.topic && (
                      <CardDescription>Topic: {request.topic}</CardDescription>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {request.user && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{request.user.name || 'Unknown'}</span>
                    <span className="text-muted-foreground">({request.user.email})</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="contacts" className="space-y-4">
        {contactSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No contact form submissions yet
              </div>
            </CardContent>
          </Card>
        ) : (
          contactSubmissions.map((contact) => (
            <Card key={contact.id} className={!contact.read ? 'border-blue-500/50 bg-blue-500/5' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{contact.subject}</CardTitle>
                      {!contact.read && (
                        <Badge variant="default">New</Badge>
                      )}
                      {contact.responded && (
                        <Badge variant="secondary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Responded
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      From: {contact.name} ({contact.email})
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(contact.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {contact.message}
                  </div>
                  <div className="flex gap-2">
                    {!contact.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkContactRead(contact.id)}
                        disabled={loading === contact.id}
                      >
                        Mark as Read
                      </Button>
                    )}
                    {!contact.responded && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkContactResponded(contact.id)}
                        disabled={loading === contact.id}
                      >
                        Mark as Responded
                      </Button>
                    )}
                    <a href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}>
                      <Button size="sm" variant="default">
                        <Mail className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}



