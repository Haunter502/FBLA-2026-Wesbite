'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, HelpCircle, Mail, Clock, User, CheckCircle2, TrendingUp, BookOpen, Calendar, Loader2, AlertCircle, Zap, Phone, MessageCircle, FileText, ArrowRight, Trash2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { MatchTutoringDialog } from '@/components/admin/match-tutoring-dialog'

interface TutoringRequest {
  id: string
  type: string
  topic: string | null
  status: string
  createdAt: number | null
  matchedTeacherId?: string | null
  matchedSlotId?: string | null
  scheduledSlotId?: string | null
  matchStatus?: string | null
  user: {
    id: string
    name: string | null
    email: string
  } | null
  matchedTeacher?: {
    id: string
    name: string
    email: string
  } | null
  matchedSlot?: {
    id: string
    start: number
    end: number
    teacher: {
      name: string
    }
  } | null
  scheduledSlot?: {
    id: string
    start: number
    end: number
    teacher: {
      name: string
    }
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
  const [matchingRequestId, setMatchingRequestId] = useState<string | null>(null)

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
      if (request.user) {
        // Try to parse from topic first
        let hasSummaryInTopic = false
        if (request.topic?.includes('[PROGRESS_SUMMARY]')) {
          try {
            const parts = request.topic.split('[PROGRESS_SUMMARY]')
            if (parts.length > 1) {
              let jsonPart = parts[1].trim()
              if (jsonPart.startsWith('\n')) {
                jsonPart = jsonPart.substring(1).trim()
              }
              let braceCount = 0
              let jsonStart = -1
              let jsonEnd = -1
              for (let i = 0; i < jsonPart.length; i++) {
                if (jsonPart[i] === '{') {
                  if (braceCount === 0) jsonStart = i
                  braceCount++
                }
                if (jsonPart[i] === '}') {
                  braceCount--
                  if (braceCount === 0) {
                    jsonEnd = i + 1
                    break
                  }
                }
              }
              if (jsonStart >= 0 && jsonEnd > jsonStart) {
                jsonPart = jsonPart.substring(jsonStart, jsonEnd)
                if (jsonPart.trim().startsWith('{') && jsonPart.trim().endsWith('}')) {
                  try {
                    const parsed = JSON.parse(jsonPart)
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                      hasSummaryInTopic = true
                    }
                  } catch (e) {
                    // JSON is malformed, will fetch from API
                  }
                }
              }
            }
          } catch (e) {
            // Error parsing, will fetch from API
          }
        }
        
        // Only fetch if we don't have summary in topic and haven't already tried
        if (!hasSummaryInTopic && progressSummaries[request.id] === undefined && !loadingSummaries[request.id]) {
          fetchProgressSummary(request.user.id, request.id)
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutoringRequests]) // Run when requests change

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

  const handleDeleteTutoringRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tutoring request? This action cannot be undone.')) {
      return
    }
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/tutoring/${id}/delete`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete tutoring request')
      }
    } catch (error) {
      console.error('Error deleting tutoring request:', error)
      alert('Error deleting tutoring request')
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact submission? This action cannot be undone.')) {
      return
    }
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/contacts/${id}/delete`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete contact submission')
      }
    } catch (error) {
      console.error('Error deleting contact submission:', error)
      alert('Error deleting contact submission')
    } finally {
      setLoading(null)
    }
  }

  // Check if a tutoring request can be cleared (session date has passed or status is completed/cancelled)
  const canClearTutoringRequest = (request: TutoringRequest): boolean => {
    // Always allow clearing if status is COMPLETED or CANCELLED
    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      return true
    }
    
    const now = new Date()
    const nowSeconds = Math.floor(now.getTime() / 1000)
    
    // Helper function to check if timestamp has passed (timestamps are in Unix seconds)
    const hasSessionPassed = (start: number, end?: number): boolean => {
      if (end) {
        // Add 1 hour buffer (3600 seconds) to ensure session is truly over
        return nowSeconds >= (end + 3600)
      } else {
        // If no end time, check if start time has passed with 2 hour buffer
        return nowSeconds >= (start + 7200)
      }
    }
    
    // Check scheduled slot first (for scheduled requests)
    if (request.scheduledSlot?.start) {
      return hasSessionPassed(request.scheduledSlot.start, request.scheduledSlot.end)
    }
    
    // If there's a matched slot, check if the session date has passed
    if (request.matchedSlot?.start) {
      return hasSessionPassed(request.matchedSlot.start, request.matchedSlot.end)
    }
    
    // For scheduled requests without a slot but with MATCHED status, 
    // allow clearing if it's been more than 7 days since creation
    if (request.type === 'SCHEDULED' && request.status === 'MATCHED' && request.createdAt) {
      const createdAtSeconds = typeof request.createdAt === 'number' 
        ? (request.createdAt < 10000000000 ? request.createdAt : Math.floor(request.createdAt / 1000))
        : Math.floor(new Date(request.createdAt).getTime() / 1000)
      const daysSinceCreation = (nowSeconds - createdAtSeconds) / (60 * 60 * 24)
      return daysSinceCreation >= 7
    }
    
    // For requests without a slot, don't allow clearing unless completed/cancelled
    return false
  }

  // Check if a contact submission can be cleared (responded)
  const canClearContact = (contact: ContactSubmission): boolean => {
    return contact.responded === true
  }


  return (
    <div className="space-y-6">
      <Tabs defaultValue="immediate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 backdrop-blur-xl p-1.5 rounded-xl border border-primary/20 shadow-lg">
          <TabsTrigger 
            value="immediate" 
            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-orange-600/10 data-[state=active]:border-orange-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 transition-all duration-300 rounded-lg border border-transparent"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">Immediate Help</span>
              <Badge variant="secondary" className="ml-1 bg-orange-500/20 text-orange-500 border-orange-500/30">
                {immediateRequests.length}
              </Badge>
            </div>
            {unreadRequests.filter(r => r.type === 'IMMEDIATE').length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="scheduled" 
            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:border-primary/30 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-lg border border-transparent"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold">Scheduled</span>
              <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary border-primary/30">
                {scheduledRequests.length}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="contacts" 
            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-blue-600/10 data-[state=active]:border-blue-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all duration-300 rounded-lg border border-transparent"
          >
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-semibold">Contact Forms</span>
              <Badge variant="secondary" className="ml-1 bg-blue-500/20 text-blue-500 border-blue-500/30">
                {contactSubmissions.length}
              </Badge>
            </div>
            {unreadContacts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background animate-pulse" />
            )}
          </TabsTrigger>
        </TabsList>

      <TabsContent value="immediate" className="space-y-4">
        {immediateRequests.length === 0 ? (
          <GlowEffect intensity="low">
            <GlassCard className="backdrop-blur-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="pt-16 pb-16">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
                    <HelpCircle className="h-12 w-12 text-primary mx-auto opacity-70" />
                  </div>
                  <p className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">No Immediate Help Requests</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
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
                <GlowEffect intensity={request.status === 'PENDING' ? 'high' : 'medium'}>
                  <GlassCard className={`backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
                    request.status === 'PENDING' 
                      ? 'border-2 border-orange-500/60 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-background shadow-2xl shadow-orange-500/30 hover:border-orange-500/80' 
                      : request.status === 'MATCHED'
                      ? 'border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background hover:border-primary/70'
                      : 'border-2 border-muted/50 hover:border-muted'
                  }`}>
                    <CardHeader className="pb-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl transition-all duration-300 ${
                              request.status === 'PENDING'
                                ? 'bg-gradient-to-br from-orange-500/30 to-orange-600/20 text-orange-500 shadow-lg shadow-orange-500/20'
                                : request.status === 'MATCHED'
                                ? 'bg-gradient-to-br from-primary/30 to-primary/20 text-primary shadow-lg shadow-primary/20'
                                : 'bg-muted/50 text-muted-foreground'
                            }`}>
                              <Zap className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                                Immediate Help Request
                                {request.status === 'PENDING' && (
                                  <Badge variant="destructive" className="animate-pulse text-xs px-2 py-1">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    URGENT
                                  </Badge>
                                )}
                              </CardTitle>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge
                                  variant={
                                    request.status === 'PENDING'
                                      ? 'destructive'
                                      : request.status === 'MATCHED'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs font-semibold px-3 py-1"
                                >
                                  {request.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {request.topic && (
                            <div className="mt-4 p-4 bg-gradient-to-br from-background/80 to-background/50 rounded-xl border-2 border-primary/20 shadow-md">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/20">
                                  <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Topic:</p>
                                  <p className="text-sm font-semibold leading-relaxed">{request.topic.split('\n\n[PROGRESS_SUMMARY]')[0] || 'No topic specified'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {request.user && (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border border-primary/10 shadow-sm">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/30">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-base mb-1">{request.user.name || 'Unknown Student'}</p>
                            <p className="text-xs text-muted-foreground font-medium">{request.user.email}</p>
                          </div>
                        </div>
                      )}

                  {/* Progress Summary - Always show for immediate requests */}
                  {(() => {
                    let summary: ProgressSummary | null = null
                    
                    // Try to parse from topic field first
                    if (request.topic?.includes('[PROGRESS_SUMMARY]')) {
                      try {
                        const parts = request.topic.split('[PROGRESS_SUMMARY]')
                        if (parts.length > 1) {
                          let jsonPart = parts[1].trim()
                          
                          // Remove leading newline if present
                          if (jsonPart.startsWith('\n')) {
                            jsonPart = jsonPart.substring(1).trim()
                          }
                          
                          // Try to extract valid JSON by finding balanced braces
                          // This handles cases where there might be extra text after the JSON
                          let braceCount = 0
                          let jsonStart = -1
                          let jsonEnd = -1
                          
                          for (let i = 0; i < jsonPart.length; i++) {
                            if (jsonPart[i] === '{') {
                              if (braceCount === 0) jsonStart = i
                              braceCount++
                            }
                            if (jsonPart[i] === '}') {
                              braceCount--
                              if (braceCount === 0) {
                                jsonEnd = i + 1
                                break
                              }
                            }
                          }
                          
                          if (jsonStart >= 0 && jsonEnd > jsonStart) {
                            jsonPart = jsonPart.substring(jsonStart, jsonEnd)
                            
                            // Only parse if we have valid JSON-looking content
                            if (jsonPart.trim().startsWith('{') && jsonPart.trim().endsWith('}')) {
                              try {
                                const parsed = JSON.parse(jsonPart)
                                // Validate that it has the expected structure
                                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                                  summary = parsed
                                }
                              } catch (parseError) {
                                // JSON is malformed, skip it
                                console.warn('Malformed JSON in progress summary, skipping:', parseError)
                                summary = null
                              }
                            }
                          }
                        }
                      } catch (e) {
                        console.error('Error extracting progress summary from topic:', e)
                        // If parsing fails, don't set summary - will fetch from API instead
                        summary = null
                      }
                    }
                    
                    // If not in topic and we have a user, fetch it
                    if (!summary && request.user) {
                      const requestSummary = progressSummaries[request.id]
                      const isLoading = loadingSummaries[request.id]
                      
                      if (requestSummary !== undefined) {
                        summary = requestSummary
                      }
                      // Note: Fetching is handled in useEffect, not during render
                    }

                    if (summary) {
                      return (
                        <div className="mt-5 p-6 bg-gradient-to-br from-primary/15 via-primary/8 to-background rounded-xl border-2 border-primary/40 shadow-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-5 flex items-center gap-3 text-primary">
                            <div className="p-2 rounded-lg bg-primary/20">
                              <TrendingUp className="h-5 w-5" />
                            </div>
                            Student Progress Summary
                          </h4>
                          <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-background/80 to-background/50 rounded-xl border border-primary/20 shadow-md">
                                <span className="text-muted-foreground font-semibold">Overall Progress:</span>
                                <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{summary.overallProgress}%</span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-background/80 to-background/50 rounded-xl border border-primary/20 shadow-md">
                                <span className="text-muted-foreground font-semibold">Overall Grade:</span>
                                <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                  {summary.overallGrade !== null && summary.overallGrade !== undefined 
                                    ? `${summary.overallGrade}%` 
                                    : 'N/A'}
                                </span>
                              </div>
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
                                  {summary.upcomingSessions.slice(0, 3).map((session: any, idx: number) => {
                                    // Clean the topic to remove progress summary JSON if present
                                    const cleanTopic = session.topic && session.topic.includes('[PROGRESS_SUMMARY]')
                                      ? session.topic.split('[PROGRESS_SUMMARY]')[0].trim()
                                      : session.topic
                                    
                                    return (
                                      <div key={idx} className="text-xs">
                                        {session.startTime ? (
                                          <span className="font-semibold">{new Date(session.startTime * 1000).toLocaleString()}</span>
                                        ) : (
                                          <span className="text-muted-foreground">Pending scheduling</span>
                                        )}
                                        {cleanTopic && (
                                          <span className="text-muted-foreground"> • {cleanTopic}</span>
                                        )}
                                      </div>
                                    )
                                  })}
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

                  {/* Matched Tutor Info */}
                  {(request.status === 'MATCHED' || request.matchedTeacherId || request.matchedSlotId) && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-primary">
                        <User className="h-4 w-4" />
                        Match Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        {request.matchedTeacher && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Teacher:</span>
                            <span className="font-medium">{request.matchedTeacher.name}</span>
                            <span className="text-muted-foreground">({request.matchedTeacher.email})</span>
                          </div>
                        )}
                        {request.matchedSlot && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Session:</span>
                              <span className="font-medium">
                                {new Date(request.matchedSlot.start * 1000).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-5">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium">
                                {new Date(request.matchedSlot.start * 1000).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}{' '}
                                -{' '}
                                {new Date(request.matchedSlot.end * 1000).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {request.matchedSlot.teacher && (
                              <div className="ml-5 text-xs text-muted-foreground">
                                with {request.matchedSlot.teacher.name}
                              </div>
                            )}
                          </div>
                        )}
                        {request.matchStatus && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge
                              variant={
                                request.matchStatus === 'ACCEPTED'
                                  ? 'default'
                                  : request.matchStatus === 'DECLINED'
                                  ? 'destructive'
                                  : request.matchStatus === 'RESCHEDULED'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="text-xs"
                            >
                              {request.matchStatus.replace('_', ' ')}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                      
                      <div className="flex gap-2 pt-4 border-t border-primary/10">
                        {request.status === 'PENDING' && (
                          <Button
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => setMatchingRequestId(request.id)}
                            disabled={loading === request.id}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Match to Tutor
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
                        {canClearTutoringRequest(request) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTutoringRequest(request.id)}
                            disabled={loading === request.id}
                          >
                            {loading === request.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear
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
                      
                      {/* Scheduled Slot Info */}
                      {request.scheduledSlot && (
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-primary">
                            <Calendar className="h-4 w-4" />
                            Scheduled Session
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium">
                                  {new Date(request.scheduledSlot.start * 1000).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 ml-5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Time:</span>
                                <span className="font-medium">
                                  {new Date(request.scheduledSlot.start * 1000).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}{' '}
                                  -{' '}
                                  {new Date(request.scheduledSlot.end * 1000).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {request.scheduledSlot.teacher && (
                                <div className="ml-5 text-xs text-muted-foreground">
                                  with {request.scheduledSlot.teacher.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Matched Tutor Info for Scheduled */}
                      {(request.status === 'MATCHED' || request.matchedTeacherId || request.matchedSlotId) && (
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-primary">
                            <User className="h-4 w-4" />
                            Match Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            {request.matchedTeacher && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Teacher:</span>
                                <span className="font-medium">{request.matchedTeacher.name}</span>
                                <span className="text-muted-foreground">({request.matchedTeacher.email})</span>
                              </div>
                            )}
                            {request.matchedSlot && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Session:</span>
                                  <span className="font-medium">
                                    {new Date(request.matchedSlot.start * 1000).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 ml-5">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Time:</span>
                                  <span className="font-medium">
                                    {new Date(request.matchedSlot.start * 1000).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}{' '}
                                    -{' '}
                                    {new Date(request.matchedSlot.end * 1000).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {request.matchedSlot.teacher && (
                                  <div className="ml-5 text-xs text-muted-foreground">
                                    with {request.matchedSlot.teacher.name}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4 border-t border-primary/10">
                        {canClearTutoringRequest(request) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTutoringRequest(request.id)}
                            disabled={loading === request.id}
                          >
                            {loading === request.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear
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
                        {canClearContact(contact) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteContact(contact.id)}
                            disabled={loading === contact.id}
                          >
                            {loading === contact.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear
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
    </Tabs>
    
    {/* Matching Dialog */}
    {matchingRequestId && (
      <MatchTutoringDialog
        open={!!matchingRequestId}
        onOpenChange={(open) => !open && setMatchingRequestId(null)}
        requestId={matchingRequestId}
        onMatchSuccess={() => {
          setMatchingRequestId(null)
          router.refresh()
        }}
      />
    )}
    </div>
  )
}



