'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, Users, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(weekday)
dayjs.extend(isoWeek)

interface Slot {
  id: string
  start: number | Date
  end: number | Date
  teacher?: {
    name: string
    email: string
  }
  spotsLeft: number
  capacity: number
  timeSlot: 'morning' | 'afternoon' | 'evening'
}

export function TutoringCalendar() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [booked, setBooked] = useState<Set<string>>(new Set())
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDateSlots, setSelectedDateSlots] = useState<Slot[]>([])

  useEffect(() => {
    fetchSlots()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      const dateSlots = slots.filter((slot) => {
        const slotDate = dayjs(typeof slot.start === 'number' ? slot.start * 1000 : slot.start)
        return slotDate.format('YYYY-MM-DD') === selectedDate
      })
      setSelectedDateSlots(dateSlots)
    }
  }, [selectedDate, slots])

  const fetchSlots = async () => {
    try {
      setError(null)
      const response = await fetch('/api/tutoring/slots')
      if (!response.ok) {
        throw new Error('Failed to fetch slots')
      }
      const data = await response.json()
      setSlots(data.slots || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
      setError('Failed to load calendar. Please refresh the page.')
      setSlots([]) // Ensure slots is always an array
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (slotId: string) => {
    try {
      const response = await fetch('/api/tutoring/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      })

      if (response.ok) {
        setBooked(new Set([...booked, slotId]))
        fetchSlots() // Refresh slots
      }
    } catch (error) {
      console.error('Error booking slot:', error)
    }
  }

  // Group slots by date
  const slotsByDate = slots.reduce((acc: Record<string, Slot[]>, slot: Slot) => {
    const slotDate = dayjs(typeof slot.start === 'number' ? slot.start * 1000 : slot.start)
    const dateKey = slotDate.format('YYYY-MM-DD')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(slot)
    return acc
  }, {})

  // Get days in current month (weekdays only)
  const daysInMonth = currentMonth.daysInMonth()
  
  // Get all weekdays in the month with their position
  const weekdays: { day: number; date: dayjs.Dayjs; weekIndex: number }[] = []
  let weekIndex = 0
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = currentMonth.date(i)
    const dayOfWeek = date.day()
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue
    }
    
    // dayOfWeek is 1-5 for Mon-Fri (we skip weekends)
    const dayInWeek = dayOfWeek - 1 // Convert to 0-4 for Mon-Fri
    
    weekdays.push({
      day: i,
      date,
      weekIndex: dayInWeek, // Will be used for positioning
    })
  }

  // Get slots for a specific date
  const getSlotsForDate = (day: number) => {
    const date = currentMonth.date(day)
    if (date.day() === 0 || date.day() === 6) return [] // Skip weekends
    const dateKey = date.format('YYYY-MM-DD')
    return slotsByDate[dateKey] || []
  }

  const previousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'))
    setSelectedDate(null)
  }

  const handleDateClick = (day: number) => {
    const date = currentMonth.date(day)
    if (date.day() === 0 || date.day() === 6) return // Don't select weekends
    const dateKey = date.format('YYYY-MM-DD')
    setSelectedDate(selectedDate === dateKey ? null : dateKey)
  }

  const getTimeSlotLabel = (slot: Slot) => {
    const hour = dayjs(typeof slot.start === 'number' ? slot.start * 1000 : slot.start).hour()
    if (hour >= 6 && hour < 12) return 'Morning'
    if (hour >= 12 && hour < 17) return 'Afternoon'
    return 'Evening'
  }

  const getTimeSlotColor = (slot: Slot) => {
    const hour = dayjs(typeof slot.start === 'number' ? slot.start * 1000 : slot.start).hour()
    if (hour >= 6 && hour < 12) return 'bg-blue-500/20 text-blue-600'
    if (hour >= 12 && hour < 17) return 'bg-yellow-500/20 text-yellow-600'
    return 'bg-purple-500/20 text-purple-600'
  }

  return (
    <div className="space-y-4 min-h-[400px] w-full bg-background border-2 border-primary/20 rounded-lg p-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="min-h-[80px] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">Loading calendar...</p>
        </>
      ) : (
        <>
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <Button variant="outline" size="sm" onClick={previousMonth} className="border-primary/30 hover:border-primary">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">
          {currentMonth.format('MMMM YYYY')}
        </h3>
        <Button variant="outline" size="sm" onClick={nextMonth} className="border-primary/30 hover:border-primary">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid - Weekdays Only */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
        {/* Create empty cells for days before first weekday */}
        {(() => {
          const firstDayOfMonth = currentMonth.startOf('month')
          const firstDayWeekday = firstDayOfMonth.day() // 0 = Sunday, 1 = Monday, etc.
          const emptyCells = []
          // Calculate how many empty cells needed before first weekday
          // If first day is Sunday (0), skip to Monday (need 0 empty cells, Monday is first)
          // If first day is Monday (1), need 0 empty cells
          // If first day is Tuesday (2), need 1 empty cell, etc.
          // If first day is Saturday (6), need 4 empty cells
          let daysToSkip = 0
          if (firstDayWeekday === 0) {
            daysToSkip = 0 // Sunday, Monday is next
          } else if (firstDayWeekday === 6) {
            daysToSkip = 4 // Saturday, need 4 empty cells
          } else {
            daysToSkip = firstDayWeekday - 1 // Mon-Fri, need (dayOfWeek - 1) empty cells
          }
          for (let i = 0; i < daysToSkip; i++) {
            emptyCells.push(<div key={`empty-${i}`} />)
          }
          return emptyCells
        })()}
        {weekdays.map(({ day, date }) => {
          const dateSlots = getSlotsForDate(day)
          const isToday = dayjs().isSame(date, 'day')
          const hasSlots = dateSlots.length > 0
          const dateKey = date.format('YYYY-MM-DD')
          const isSelected = selectedDate === dateKey

          return (
            <div
              key={day}
              className={`min-h-[80px] p-2 border-2 rounded-lg cursor-pointer transition-all ${
                isToday ? 'bg-primary/20 border-primary shadow-md shadow-primary/20' : 'border-border bg-card'
              } ${isSelected ? 'ring-2 ring-primary ring-offset-2 bg-primary/10' : ''} ${
                hasSlots ? 'hover:bg-muted/50 hover:border-primary/50 hover:shadow-sm' : 'opacity-60'
              }`}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                {day}
              </div>
              {hasSlots ? (
                <div className="space-y-1">
                  {dateSlots.slice(0, 3).map((slot: Slot) => (
                    <div
                      key={slot.id}
                      className={`text-xs ${getTimeSlotColor(slot)} px-1.5 py-0.5 rounded font-medium truncate`}
                      title={`${getTimeSlotLabel(slot)}: ${dayjs(typeof slot.start === 'number' ? slot.start * 1000 : slot.start).format('h:mm A')} - ${slot.teacher?.name || 'Teacher'}`}
                    >
                      {getTimeSlotLabel(slot)}
                    </div>
                  ))}
                  {dateSlots.length > 3 && (
                    <div className="text-xs text-muted-foreground font-medium">
                      +{dateSlots.length - 3} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground/50">No slots</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Date Slots */}
      {selectedDate && selectedDateSlots.length > 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">
                Sessions for {dayjs(selectedDate).format('MMMM D, YYYY')}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {selectedDateSlots
                .sort((a, b) => {
                  const aTime = dayjs(typeof a.start === 'number' ? a.start * 1000 : a.start)
                  const bTime = dayjs(typeof b.start === 'number' ? b.start * 1000 : b.start)
                  return aTime.diff(bTime)
                })
                .map((slot) => (
                  <Card key={slot.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {getTimeSlotLabel(slot)}: {dayjs(typeof slot.start === 'number' ? slot.start * 1000 : slot.start).format('h:mm A')} - {dayjs(typeof slot.end === 'number' ? slot.end * 1000 : slot.end).format('h:mm A')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{slot.spotsLeft} spots available</span>
                          </div>
                          <div className="text-sm font-medium">{slot.teacher?.name}</div>
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
                            'Book Session'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedDateSlots.length === 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No sessions available for {dayjs(selectedDate).format('MMMM D, YYYY')}
            </p>
          </CardContent>
        </Card>
      )}

          {slots.length === 0 && !selectedDate && (
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center mt-4">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground font-medium">
                No upcoming sessions available. Check back later!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
