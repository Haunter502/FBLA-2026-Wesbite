"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Users, Check, ChevronLeft, ChevronRight } from "lucide-react"
import dayjs from "dayjs"
import weekday from "dayjs/plugin/weekday"
import isoWeek from "dayjs/plugin/isoWeek"

dayjs.extend(weekday)
dayjs.extend(isoWeek)

interface Slot {
  id: string
  start: number
  end: number
  capacity: number
  spotsLeft: number
  teacher: {
    name: string
    email: string
  }
  timeSlot?: 'morning' | 'afternoon' | 'evening'
}

export function TutoringCalendar() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [booked, setBooked] = useState<Set<string>>(new Set())
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/tutoring/slots")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Fetched slots:", data.slots?.length || 0)
      setSlots(data.slots || [])
    } catch (error) {
      console.error("Error fetching slots:", error)
      setSlots([])
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

  const getTimeSlotLabel = (hour: number): 'morning' | 'afternoon' | 'evening' => {
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    return 'evening'
  }

  const getTimeSlotColor = (timeSlot: 'morning' | 'afternoon' | 'evening') => {
    switch (timeSlot) {
      case 'morning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200'
      case 'afternoon':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-200'
      case 'evening':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-200'
    }
  }

  const getSlotsForDate = (date: dayjs.Dayjs) => {
    const dateStart = date.startOf('day').unix()
    const dateEnd = date.endOf('day').unix()
    return slots.filter(slot => {
      // Handle Unix seconds (number), Date objects, or ISO date strings
      let slotStart: number
      if (typeof slot.start === 'number') {
        // If it's a number, check if it's seconds or milliseconds
        slotStart = slot.start > 1e12 ? Math.floor(slot.start / 1000) : slot.start
      } else if (slot.start && typeof slot.start === 'object' && 'getTime' in slot.start) {
        slotStart = Math.floor((slot.start as Date).getTime() / 1000)
      } else {
        // It's likely an ISO date string (from API JSON serialization)
        const dateObj = new Date(slot.start as string)
        slotStart = isNaN(dateObj.getTime()) ? 0 : Math.floor(dateObj.getTime() / 1000)
      }
      return slotStart >= dateStart && slotStart < dateEnd
    })
  }

  const getDaysInMonth = () => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    const startOfCalendar = startOfMonth.startOf('week')
    const endOfCalendar = endOfMonth.endOf('week')
    const days: dayjs.Dayjs[] = []
    let current = startOfCalendar
    while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
      days.push(current)
      current = current.add(1, 'day')
    }
    return days
  }

  const days = getDaysInMonth()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const selectedDateSlots = selectedDate ? getSlotsForDate(selectedDate) : []

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading available slots...</p>
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-lg">
          {currentMonth.format('MMMM YYYY')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const daySlots = getSlotsForDate(day)
          const isCurrentMonth = day.month() === currentMonth.month()
          const isToday = day.isSame(dayjs(), 'day')
          const isSelected = selectedDate?.isSame(day, 'day')

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`
                aspect-square p-1 text-sm rounded-md border transition-colors
                ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                ${isToday ? 'border-primary bg-primary/10' : 'border-border'}
                ${isSelected ? 'border-primary bg-primary/20' : 'hover:bg-accent'}
                ${daySlots.length > 0 ? 'font-semibold' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{day.date()}</span>
                {daySlots.length > 0 && (
                  <span className="text-xs text-primary">
                    {daySlots.length}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Date Slots */}
      {selectedDate && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-semibold mb-3">
                Sessions for {selectedDate.format('MMMM D, YYYY')}
              </h4>
              {selectedDateSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sessions available for this date.
                </p>
              ) : (
                    selectedDateSlots.map((slot) => {
                      // Handle Unix seconds (number) or ISO date strings
                      let slotStartUnix: number
                      if (typeof slot.start === 'number') {
                        slotStartUnix = slot.start > 1e12 ? Math.floor(slot.start / 1000) : slot.start
                      } else {
                        const dateObj = new Date(slot.start as string)
                        slotStartUnix = isNaN(dateObj.getTime()) ? 0 : Math.floor(dateObj.getTime() / 1000)
                      }
                      
                      const startDate = new Date(slotStartUnix * 1000)
                      const hour = startDate.getHours()
                      const timeSlot = slot.timeSlot || getTimeSlotLabel(hour)
                  
                  return (
                    <Card key={slot.id} className={`border ${getTimeSlotColor(timeSlot)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                                  <span className="font-semibold">
                                    {(() => {
                                      let startUnix: number
                                      let endUnix: number
                                      if (typeof slot.start === 'number') {
                                        startUnix = slot.start > 1e12 ? Math.floor(slot.start / 1000) : slot.start
                                      } else {
                                        const dateObj = new Date(slot.start as string)
                                        startUnix = isNaN(dateObj.getTime()) ? 0 : Math.floor(dateObj.getTime() / 1000)
                                      }
                                      if (typeof slot.end === 'number') {
                                        endUnix = slot.end > 1e12 ? Math.floor(slot.end / 1000) : slot.end
                                      } else {
                                        const dateObj = new Date(slot.end as string)
                                        endUnix = isNaN(dateObj.getTime()) ? 0 : Math.floor(dateObj.getTime() / 1000)
                                      }
                                      return `${dayjs(startUnix * 1000).format("h:mm A")} - ${dayjs(endUnix * 1000).format("h:mm A")}`
                                    })()}
                                  </span>
                              <span className="text-xs px-2 py-1 rounded bg-background/50">
                                {timeSlot}
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
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

