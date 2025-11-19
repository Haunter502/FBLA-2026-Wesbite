"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, MessageCircle } from "lucide-react"

interface ImmediateHelpProps {
  userId: string
}

export function ImmediateHelp({ userId }: ImmediateHelpProps) {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/tutoring/immediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, userId }),
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

