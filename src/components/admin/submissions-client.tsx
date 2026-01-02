'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, HelpCircle, Mail, Clock, User, CheckCircle2, TrendingUp, BookOpen, Calendar, Loader2, AlertCircle, Zap, Phone, MessageCircle, FileText, ArrowRight } from "lucide-react"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'

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
    <div className="space-y-6">
      <Tabs defaultValue="immediate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="immediate" className="relative">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Immediate Help</span>
              <Badge variant="secondary" className="ml-1">
                {immediateRequests.length}
              </Badge>
            </div>
            {unreadRequests.filter(r => r.type === 'IMMEDIATE').length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background" />
            )}
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="relative">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Scheduled</span>
              <Badge variant="secondary" className="ml-1">
                {scheduledRequests.length}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="relative">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Contact Forms</span>
              <Badge variant="secondary" className="ml-1">
                {contactSubmissions.length}
              </Badge>
            </div>
            {unreadContacts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background" />
            )}
          </TabsTrigger>
        </TabsList>

      <TabsContent value="immediate" className="space-y-4">
        {immediateRequests.length === 0 ? (
          <GlowEffect intensity="low">
            <GlassCard className="backdrop-blur-xl">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">No Immediate Help Requests</p>
                  <p className="text-sm text-muted-foreground">
                    All caught up! No students are currently requesting immediate assistance.
                  </p>
                </div>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        ) : (
          <AnimatePresence mode="popLayout">
            {immediateRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlowEffect intensity={request.status === 'PENDING' ? 'medium' : 'low'}>
                  <GlassCard className={`backdrop-blur-xl transition-all ${
                    request.status === 'PENDING' 
                      ? 'border-orange-500/50 bg-orange-500/10 shadow-lg shadow-orange-500/20' 
                      : request.status === 'MATCHED'
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-muted'
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              request.status === 'PENDING'
                                ? 'bg-orange-500/20 text-orange-500'
                                : request.status === 'MATCHED'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <Zap className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl flex items-center gap-2">
                                Immediate Help Request
                                {request.status === 'PENDING' && (
                                  <Badge variant="destructive" className="animate-pulse">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    URGENT
                                  </Badge>
                                )}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    request.status === 'PENDING'
                                      ? 'destructive'
                                      : request.status === 'MATCHED'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {request.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {request.topic && (
                            <div className="mt-3 p-3 bg-background/50 rounded-lg border border-primary/10">
                              <div className="flex items-start gap-2">
                                <MessageCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1 font-medium">Topic:</p>
                                  <p className="text-sm font-medium">{request.topic.split('\n\n[PROGRESS_SUMMARY]')[0] || 'No topic specified'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {request.user && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{request.user.name || 'Unknown Student'}</p>
                            <p className="text-xs text-muted-foreground">{request.user.email}</p>
                          </div>
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
                      
                      <div className="flex gap-2 pt-4 border-t border-primary/10">
                        {request.status === 'PENDING' && (
                          <Button
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => handleUpdateRequestStatus(request.id, 'MATCHED')}
                            disabled={loading === request.id}
                          >
                            {loading === request.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark as Matched
                              </>
                            )}
                          </Button>
                        )}
                        {request.status !== 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant={request.status === 'PENDING' ? 'outline' : 'default'}
                            className={request.status === 'PENDING' ? 'flex-1' : ''}
                            onClick={() => handleUpdateRequestStatus(request.id, 'COMPLETED')}
                            disabled={loading === request.id}
                          >
                            {loading === request.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </GlassCard>
                </GlowEffect>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </TabsContent>

      <TabsContent value="scheduled" className="space-y-4">
        {scheduledRequests.length === 0 ? (
          <GlowEffect intensity="low">
            <GlassCard className="backdrop-blur-xl">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">No Scheduled Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    No scheduled tutoring requests at this time.
                  </p>
                </div>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        ) : (
          <AnimatePresence mode="popLayout">
            {scheduledRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlowEffect intensity="low">
                  <GlassCard className={`backdrop-blur-xl transition-all ${
                    request.status === 'PENDING' 
                      ? 'border-orange-500/50 bg-orange-500/10' 
                      : request.status === 'MATCHED'
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-muted'
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              request.status === 'PENDING'
                                ? 'bg-orange-500/20 text-orange-500'
                                : request.status === 'MATCHED'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl">Scheduled Session</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    request.status === 'PENDING'
                                      ? 'destructive'
                                      : request.status === 'MATCHED'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {request.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {request.topic && (
                            <div className="mt-3 p-3 bg-background/50 rounded-lg border border-primary/10">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1 font-medium">Topic:</p>
                                  <p className="text-sm font-medium">{request.topic}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {request.user && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{request.user.name || 'Unknown Student'}</p>
                            <p className="text-xs text-muted-foreground">{request.user.email}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </GlassCard>
                </GlowEffect>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </TabsContent>

      <TabsContent value="contacts" className="space-y-4">
        {contactSubmissions.length === 0 ? (
          <GlowEffect intensity="low">
            <GlassCard className="backdrop-blur-xl">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">No Contact Submissions</p>
                  <p className="text-sm text-muted-foreground">
                    No contact form submissions at this time.
                  </p>
                </div>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        ) : (
          <AnimatePresence mode="popLayout">
            {contactSubmissions.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlowEffect intensity={!contact.read ? 'medium' : 'low'}>
                  <GlassCard className={`backdrop-blur-xl transition-all ${
                    !contact.read 
                      ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                      : 'border-muted'
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              !contact.read
                                ? 'bg-blue-500/20 text-blue-500'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <Mail className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl flex items-center gap-2">
                                {contact.subject}
                                {!contact.read && (
                                  <Badge variant="default" className="animate-pulse">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    NEW
                                  </Badge>
                                )}
                                {contact.responded && (
                                  <Badge variant="secondary">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Responded
                                  </Badge>
                                )}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(contact.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-background/50 rounded-lg border border-primary/10">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1 font-medium">From:</p>
                                <p className="text-sm font-semibold">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg border border-primary/10">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{contact.message}</p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-primary/10">
                        {!contact.read && (
                          <Button
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => handleMarkContactRead(contact.id)}
                            disabled={loading === contact.id}
                          >
                            {loading === contact.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark as Read
                              </>
                            )}
                          </Button>
                        )}
                        {!contact.responded && (
                          <Button
                            size="sm"
                            variant={!contact.read ? 'outline' : 'default'}
                            className={!contact.read ? 'flex-1' : ''}
                            onClick={() => handleMarkContactResponded(contact.id)}
                            disabled={loading === contact.id}
                          >
                            {loading === contact.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Mail className="h-4 w-4 mr-2" />
                                Mark as Responded
                              </>
                            )}
                          </Button>
                        )}
                        <a href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}>
                          <Button size="sm" variant="default" className="bg-primary hover:bg-primary/90">
                            <Mail className="h-4 w-4 mr-2" />
                            Reply
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </GlassCard>
                </GlowEffect>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </TabsContent>
    </Tabs>
    </div>
  )
}



