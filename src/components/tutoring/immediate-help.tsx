"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, MessageCircle, BookOpen, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

interface ImmediateHelpProps {
  userId: string
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

export function ImmediateHelp({ userId }: ImmediateHelpProps) {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)

  useEffect(() => {
    // Fetch progress summary when component mounts
    const fetchSummary = async () => {
      try {
        const response = await fetch(`/api/students/${userId}/progress-summary`)
        if (response.ok) {
          const data = await response.json()
          setProgressSummary(data)
        }
      } catch (error) {
        console.error("Error fetching progress summary:", error)
      } finally {
        setLoadingSummary(false)
      }
    }
    fetchSummary()
  }, [userId])

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/tutoring/immediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic, 
          userId,
          progressSummary, // Include progress summary in the request
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRequested(true)
        setRequestId(data.requestId)
        setTopic("")
      }
    } catch (error) {
      console.error("Error requesting help:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return "Not scheduled"
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (requested) {
    return (
      <Card className="border-primary">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Request Submitted!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We're matching you with an available teacher. You'll receive a notification shortly.
          </p>
          <div className="space-y-2 text-sm text-left bg-muted p-4 rounded-md">
            <p className="font-semibold">What to prepare:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Specific questions or topics you need help with</li>
              <li>Your current understanding of the material</li>
              <li>Any work you've already attempted</li>
            </ul>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setRequested(false)
              setRequestId(null)
            }}
          >
            Request Another Session
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress Summary Preview */}
      {!loadingSummary && progressSummary && (
        <Card className="bg-muted/50 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Your Progress Summary
            </CardTitle>
            <CardDescription className="text-xs">
              This information will be shared with your teacher
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {/* Overall Progress and Grade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Overall Progress:</span>
                <span className="font-semibold">{progressSummary.overallProgress}%</span>
              </div>
              {progressSummary.overallGrade !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Overall Grade:</span>
                  <span className="font-semibold text-primary">{progressSummary.overallGrade}%</span>
                </div>
              )}
            </div>

            {/* Current Unit */}
            {progressSummary.currentUnit && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Current Unit:
                  </span>
                  <Link 
                    href={`/units/${progressSummary.currentUnit.slug}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {progressSummary.currentUnit.title}
                  </Link>
                </div>
                <div className="ml-4 text-xs text-muted-foreground">
                  {progressSummary.currentUnit.progress.completedLessons} / {progressSummary.currentUnit.progress.totalLessons} lessons completed
                  {progressSummary.currentUnit.progress.grade && (
                    <span className="ml-2">• Grade: {progressSummary.currentUnit.progress.grade}%</span>
                  )}
                </div>
              </div>
            )}

            {/* Next Lesson */}
            {progressSummary.nextLesson && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next Lesson:</span>
                <Link 
                  href={`/lessons/${progressSummary.nextLesson.slug}`}
                  className="font-semibold text-primary hover:underline text-right max-w-[60%] truncate"
                >
                  {progressSummary.nextLesson.title}
                </Link>
              </div>
            )}

            {/* Upcoming Sessions */}
            {progressSummary.upcomingSessions.length > 0 && (
              <div className="space-y-1 pt-2 border-t">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Upcoming Sessions:</span>
                </div>
                {progressSummary.upcomingSessions.slice(0, 2).map((session) => (
                  <div key={session.id} className="ml-4 text-xs">
                    {session.startTime ? (
                      <span>{formatTime(session.startTime)}</span>
                    ) : (
                      <span className="text-muted-foreground">Pending scheduling</span>
                    )}
                    {session.topic && (
                      <span className="text-muted-foreground"> • {session.topic}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleRequest} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">What do you need help with?</Label>
          <Input
            id="topic"
            placeholder="e.g., Solving quadratic equations, Factoring polynomials..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Requesting...
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 mr-2" />
              Request Immediate Help
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          We'll match you with an available teacher as soon as possible.
        </p>
      </form>

      {/* How It Works Section */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-semibold text-sm mb-4">How It Works</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex-shrink-0">
                1
              </div>
              <h5 className="font-semibold text-sm">Choose Your Option</h5>
            </div>
            <p className="text-xs text-muted-foreground ml-8">
              Schedule a session in advance or request immediate help
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex-shrink-0">
                2
              </div>
              <h5 className="font-semibold text-sm">Get Matched</h5>
            </div>
            <p className="text-xs text-muted-foreground ml-8">
              We'll connect you with an available teacher based on your needs
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex-shrink-0">
                3
              </div>
              <h5 className="font-semibold text-sm">Learn Together</h5>
            </div>
            <p className="text-xs text-muted-foreground ml-8">
              Join your session and get personalized help with your questions
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}

