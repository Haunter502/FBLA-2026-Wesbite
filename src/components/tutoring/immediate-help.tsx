"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
    matchStatus: string | null
    matchedTeacher: {
      id: string
      name: string
      email: string
    } | null
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
        } else {
          console.error("Failed to fetch progress summary:", response.status)
          // Set to empty object so the card still shows
          setProgressSummary({
            overallProgress: 0,
            overallGrade: null,
            currentUnit: null,
            nextLesson: null,
            upcomingSessions: [],
          })
        }
      } catch (error) {
        console.error("Error fetching progress summary:", error)
        // Set to empty object so the card still shows
        setProgressSummary({
          overallProgress: 0,
          overallGrade: null,
          currentUnit: null,
          nextLesson: null,
          upcomingSessions: [],
        })
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
    <div className="space-y-6">
      {/* Progress Summary Preview */}
      {loadingSummary ? (
        <Card className="bg-muted/50 border-primary/20">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading your progress...</p>
          </CardContent>
        </Card>
      ) : progressSummary && (
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-primary/20">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  Your Progress Summary
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  This information will be shared with your teacher
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {/* Overall Progress and Grade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-background/60 rounded-lg border border-primary/10">
                <div className="text-xs text-muted-foreground mb-1">Overall Progress</div>
                <div className="text-2xl font-bold text-foreground">{progressSummary.overallProgress}%</div>
              </div>
              {progressSummary.overallGrade !== null && (
                <div className="p-3 bg-background/60 rounded-lg border border-primary/10">
                  <div className="text-xs text-muted-foreground mb-1">Overall Grade</div>
                  <div className="text-2xl font-bold text-primary">{progressSummary.overallGrade}%</div>
                </div>
              )}
            </div>

            {/* Current Unit */}
            {progressSummary.currentUnit && (
              <div className="p-4 bg-background/60 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">Current Unit</span>
                </div>
                <Link 
                  href={`/units/${progressSummary.currentUnit.slug}`}
                  className="font-semibold text-primary hover:underline block mb-2"
                >
                  {progressSummary.currentUnit.title}
                </Link>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-medium">{progressSummary.currentUnit.progress.completedLessons}</span>
                  <span>/</span>
                  <span className="font-medium">{progressSummary.currentUnit.progress.totalLessons}</span>
                  <span>lessons completed</span>
                  {progressSummary.currentUnit.progress.grade && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-primary">Grade: {progressSummary.currentUnit.progress.grade}%</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Next Lesson */}
            {progressSummary.nextLesson && (
              <div className="p-4 bg-background/60 rounded-lg border border-primary/10">
                <div className="text-xs text-muted-foreground font-medium mb-2">Next Recommended Lesson</div>
                <Link 
                  href={`/lessons/${progressSummary.nextLesson.slug}`}
                  className="font-semibold text-primary hover:underline block line-clamp-2"
                >
                  {progressSummary.nextLesson.title}
                </Link>
              </div>
            )}

            {/* Upcoming Sessions */}
            {progressSummary.upcomingSessions.length > 0 && (
              <div className="pt-3 border-t border-primary/20 -mb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-3">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Upcoming Sessions</span>
                </div>
                <ScrollArea className="h-[90px] pr-4">
                  <div className="space-y-2">
                    {progressSummary.upcomingSessions.map((session) => {
                      // Clean the topic to remove progress summary JSON if present
                      const cleanTopic = session.topic && session.topic.includes('[PROGRESS_SUMMARY]')
                        ? session.topic.split('[PROGRESS_SUMMARY]')[0].trim()
                        : session.topic
                      
                      return (
                        <div key={session.id} className="flex items-center gap-2 p-2 bg-background/40 rounded text-xs">
                          <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
                          <div className="flex-1 flex items-center gap-2 flex-wrap">
                            {session.startTime ? (
                              <span className="font-medium">{formatTime(session.startTime)}</span>
                            ) : session.matchStatus === 'ACCEPTED' && session.matchedTeacher ? (
                              <span className="font-medium text-primary">Matched with {session.matchedTeacher.name}</span>
                            ) : (
                              <span className="text-muted-foreground">Pending scheduling</span>
                            )}
                            {session.matchStatus === 'ACCEPTED' && session.matchedTeacher && session.startTime && (
                              <span className="text-primary">• {session.matchedTeacher.name}</span>
                            )}
                            {cleanTopic && (
                              <span className="text-muted-foreground truncate">• {cleanTopic}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleRequest} className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="topic" className="text-base font-semibold">
            What do you need help with?
          </Label>
          <Input
            id="topic"
            placeholder="e.g., Solving quadratic equations, Factoring polynomials..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            className="h-12 text-base"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Requesting Help...
            </>
          ) : (
            <>
              <MessageCircle className="h-5 w-5 mr-2" />
              Request Immediate Help
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
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
    </div>
  )
}

