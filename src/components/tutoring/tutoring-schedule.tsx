"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, Check } from "lucide-react"
import dayjs from "dayjs"

export function TutoringSchedule() {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [booked, setBooked] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/tutoring/slots")
      const data = await response.json()
      setSlots(data.slots || [])
    } catch (error) {
      console.error("Error fetching slots:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (slotId: string) => {
    try {
      const response = await fetch("/api/tutoring/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      })

      if (response.ok) {
        setBooked(new Set([...booked, slotId]))
        fetchSlots() // Refresh slots
      }
    } catch (error) {
      console.error("Error booking slot:", error)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading available slots...</p>
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No upcoming sessions available. Check back later!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {slots.map((slot) => (
        <Card key={slot.id} className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {dayjs(slot.start).format("MMM D, YYYY")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {dayjs(slot.start).format("h:mm A")} - {dayjs(slot.end).format("h:mm A")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{slot.spotsLeft} spots available</span>
                </div>
                <div className="text-sm font-medium">{slot.teacher.name}</div>
              </div>
              <Button
                onClick={() => handleBook(slot.id)}
                disabled={slot.spotsLeft === 0 || booked.has(slot.id)}
                size="sm"
              >
                {booked.has(slot.id) ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Booked
                  </>
                ) : (
                  "Book Session"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

