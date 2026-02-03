'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle2, XCircle, Calendar, Clock, User, Mail, MessageSquare } from 'lucide-react'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'

interface MatchData {
  request: {
    id: string
    userId: string
    type: string
    topic: string | null
    status: string
    matchedTeacherId: string | null
    matchedSlotId: string | null
    matchStatus: string | null
    matchResponse: string | null
    createdAt: number
    teacher: {
      id: string
      name: string
      email: string
      bio: string
      officeHours: string | null
    } | null
    slot: {
      id: string
      start: number
      end: number
      capacity: number
      spotsLeft: number
    } | null
  }
}

export function MatchResponseClient({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [action, setAction] = useState<'accept' | 'decline' | 'reschedule' | null>(null)
  const [message, setMessage] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatch()
  }, [requestId])

  async function fetchMatch() {
    setFetchError(null)
    try {
      const res = await fetch(`/api/tutoring/matches/${requestId}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const raw = typeof data?.error === 'string' ? data.error : ''
        const message =
          res.status === 401
            ? 'Please log in again to view this match.'
            : res.status === 403
              ? 'You don\'t have permission to view this match.'
              : res.status === 404
                ? 'This request was not found or has been removed.'
                : raw || 'Failed to load match. Please try again.'
        setFetchError(message)
        setMatchData(null)
        return
      }
      setMatchData(data)
    } catch (error) {
      console.error('Error fetching match:', error)
      setFetchError('Failed to load match. Please try again.')
      setMatchData(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleResponse(actionType: 'accept' | 'decline' | 'reschedule') {
    if (submitting) return

    // Refresh the request data first to ensure we have the latest status
    await fetchMatch()

    // Check if the request is still in a valid state
    if (!matchData?.request) {
      alert('Unable to load request data. Please refresh the page and try again.')
      return
    }

    const { request } = matchData
    if (request.status !== 'MATCHED' || request.matchStatus !== 'PENDING_ACCEPTANCE') {
      let statusMessage = 'This request is no longer awaiting acceptance.'
      if (request.matchStatus === 'ACCEPTED') {
        statusMessage = 'This match has already been accepted.'
      } else if (request.matchStatus === 'DECLINED') {
        statusMessage = 'This match has already been declined.'
      } else if (request.matchStatus === 'RESCHEDULED') {
        statusMessage = 'A rematch has already been requested for this match.'
      }
      alert(statusMessage)
      // Refresh to show updated status
      await fetchMatch()
      return
    }

    setSubmitting(true)
    setAction(actionType)
    try {
      const res = await fetch(`/api/tutoring/matches/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          message: message.trim() || undefined,
        }),
      })

      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to submit response'
        try {
          const errorData = await res.json()
          errorMessage = errorData.error || errorMessage
          if (errorData.details) {
            errorMessage += `: ${JSON.stringify(errorData.details)}`
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = res.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Refresh the data to get updated teacher info
      await fetchMatch()
      // Force a router refresh to update the page
      router.refresh()
    } catch (error) {
      console.error('Error submitting response:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit response. Please try again.'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
      setAction(null)
      setMessage('')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!matchData || !matchData.request) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              {fetchError ?? 'Match not found or you don\'t have permission to view it.'}
            </p>
            <Button variant="outline" onClick={() => { setLoading(true); fetchMatch(); }}>
              Try again
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { request } = matchData
  const isPending = request.matchStatus === 'PENDING_ACCEPTANCE'
  const isAccepted = request.matchStatus === 'ACCEPTED'
  const isDeclined = request.matchStatus === 'DECLINED'
  const isRescheduled = request.matchStatus === 'RESCHEDULED'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tutoring Session Match</h1>
        <p className="text-muted-foreground">
          {isPending && 'Please review and respond to your tutoring match'}
          {isAccepted && request.teacher 
            ? `You have accepted a match with ${request.teacher.name}`
            : 'You have accepted this tutoring match'}
          {isDeclined && 'You have declined this tutoring match'}
          {isRescheduled && 'You have requested to rematch with a different tutor'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Request Info */}
        <GlowEffect intensity="low">
          <GlassCard className="backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Your Request</CardTitle>
                <Badge
                  variant={
                    request.type === 'IMMEDIATE'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {request.type === 'IMMEDIATE' ? 'Immediate Help' : 'Scheduled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {request.topic && (() => {
                // Extract just the topic text, removing the progress summary if present
                const topicText = request.topic.includes('[PROGRESS_SUMMARY]')
                  ? request.topic.split('[PROGRESS_SUMMARY]')[0].trim()
                  : request.topic
                
                return topicText ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Topic:</p>
                        <p className="font-medium">{topicText}</p>
                      </div>
                    </div>
                  </div>
                ) : null
              })()}
            </CardContent>
          </GlassCard>
        </GlowEffect>

        {/* Teacher Info - Show for pending or accepted matches */}
        {request.teacher && (
          <GlowEffect intensity="medium">
            <GlassCard className="backdrop-blur-xl border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {isAccepted ? 'Your Matched Teacher' : 'Matched Teacher'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-primary">{request.teacher.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3" />
                      {request.teacher.email}
                    </p>
                  </div>
                  {request.teacher.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {request.teacher.bio}
                    </p>
                  )}
                  {request.teacher.officeHours && (
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-xs text-muted-foreground">Office Hours</p>
                        <p className="text-foreground">{request.teacher.officeHours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        )}
        
        {/* Show teacher name even if full teacher data isn't loaded yet for accepted matches */}
        {isAccepted && !request.teacher && request.matchedTeacherId && (
          <GlowEffect intensity="medium">
            <GlassCard className="backdrop-blur-xl border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Your Matched Teacher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Teacher information is being loaded. Please refresh the page to see details.
                </p>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        )}

        {/* Slot Info */}
        {request.slot && (
          <GlowEffect intensity="low">
            <GlassCard className="backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Scheduled Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {(() => {
                        try {
                          const startTimestamp = typeof request.slot.start === 'number' 
                            ? request.slot.start 
                            : Math.floor(new Date(request.slot.start).getTime() / 1000)
                          const date = new Date(startTimestamp * 1000)
                          if (isNaN(date.getTime())) return 'Date TBD'
                          return date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        } catch (e) {
                          return 'Date TBD'
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {(() => {
                        try {
                          const startTimestamp = typeof request.slot.start === 'number' 
                            ? request.slot.start 
                            : Math.floor(new Date(request.slot.start).getTime() / 1000)
                          const endTimestamp = typeof request.slot.end === 'number' 
                            ? request.slot.end 
                            : Math.floor(new Date(request.slot.end).getTime() / 1000)
                          const startDate = new Date(startTimestamp * 1000)
                          const endDate = new Date(endTimestamp * 1000)
                          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                            return 'Time TBD'
                          }
                          return `${startDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })} - ${endDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}`
                        } catch (e) {
                          return 'Time TBD'
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        )}

        {/* Response Section */}
        {isPending && (
          <GlowEffect intensity="high">
            <GlassCard className="backdrop-blur-xl border-primary/50">
              <CardHeader>
                <CardTitle className="text-xl">Your Response</CardTitle>
                <CardDescription>
                  Please accept, decline, or request to rematch with a different tutor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Optional: Add a message for the admin..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleResponse('accept')}
                    disabled={submitting}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {submitting && action === 'accept' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept Match
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleResponse('decline')}
                    disabled={submitting}
                    variant="destructive"
                    className="flex-1"
                  >
                    {submitting && action === 'decline' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleResponse('reschedule')}
                    disabled={submitting}
                    variant="outline"
                    className="flex-1"
                  >
                    {submitting && action === 'reschedule' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        Rematch
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        )}

        {/* Status Display */}
        {!isPending && (
          <GlowEffect intensity="low">
            <GlassCard className="backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  {isAccepted && (
                    <>
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                      <div>
                        <p className="text-xl font-semibold text-green-500 mb-2">
                          Match Accepted!
                        </p>
                        {request.teacher ? (
                          <div className="space-y-2">
                            <p className="text-muted-foreground">
                              You've been matched with <span className="font-semibold text-foreground">{request.teacher.name}</span>.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Your tutoring session has been confirmed. You'll receive further details via email.
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Your tutoring session has been confirmed. You'll receive further details via email.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {isDeclined && (
                    <>
                      <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                      <div>
                        <p className="text-xl font-semibold text-red-500 mb-2">
                          Match Declined
                        </p>
                        <p className="text-muted-foreground">
                          This match has been declined. You can request help again anytime.
                        </p>
                      </div>
                    </>
                  )}
                  {isRescheduled && (
                    <>
                      <User className="h-16 w-16 text-orange-500 mx-auto" />
                      <div>
                        <p className="text-xl font-semibold text-orange-500 mb-2">
                          Rematch Requested
                        </p>
                        <p className="text-muted-foreground">
                          Your request to rematch has been sent. An admin will match you with a different tutor.
                        </p>
                      </div>
                    </>
                  )}
                  {request.matchResponse && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Your message:</p>
                      <p className="text-sm">{request.matchResponse}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        )}
      </div>
    </div>
  )
}

