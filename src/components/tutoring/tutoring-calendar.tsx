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

  // Build calendar weeks (Monday through Saturday, excluding Sunday)
  const weeks: Array<Array<{ day: number; date: dayjs.Dayjs } | null>> = []
  
  // Get the first day of the month
  const firstDay = currentMonth.startOf('month')
  
  // Find the Monday of the week containing the first day
  // day() returns 0=Sunday, 1=Monday, 2=Tuesday, etc.
  let startDate = firstDay
  const firstDayOfWeek = firstDay.day()
  
  // Calculate days to go back to get to Monday
  // If Sunday (0), go back 6 days. Otherwise go back (dayOfWeek - 1) days
  if (firstDayOfWeek === 0) {
    startDate = firstDay.subtract(6, 'day')
  } else if (firstDayOfWeek !== 1) {
    startDate = firstDay.subtract(firstDayOfWeek - 1, 'day')
  }
  
  // Get the last day of the month
  const lastDay = currentMonth.endOf('month')
  const lastDayOfWeek = lastDay.day()
  
  // Calculate the Saturday of the week containing the last day
  let endDate = lastDay
  if (lastDayOfWeek !== 0 && lastDayOfWeek !== 6) {
    // If not Sunday or Saturday, go forward to Saturday
    endDate = lastDay.add(6 - lastDayOfWeek, 'day')
  } else if (lastDayOfWeek === 0) {
    // If Sunday, go back to Saturday
    endDate = lastDay.subtract(1, 'day')
  }
  
  // Build weeks starting from the Monday
  let currentDate = startDate
  
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    const week: Array<{ day: number; date: dayjs.Dayjs } | null> = []
    
    // Build a week (Monday through Saturday, 6 days total)
    for (let i = 0; i < 6; i++) {
      // Skip if it's Sunday (shouldn't happen if logic is correct, but just in case)
      if (currentDate.day() === 0) {
        currentDate = currentDate.add(1, 'day')
        i-- // Decrement to maintain the loop count
        continue
      }
      
      // Only include days from the current month
      if (currentDate.month() === currentMonth.month()) {
        week.push({
          day: currentDate.date(),
          date: currentDate,
        })
      } else {
        week.push(null) // Day from previous/next month
      }
      
      currentDate = currentDate.add(1, 'day')
    }
    
    // Add the week (even if it has nulls, we want to show the structure)
    weeks.push(week)
    
    // Stop if we've passed the end date
    if (currentDate.isAfter(endDate)) {
      break
    }
  }

  // Get slots for a specific date (Saturday will always return empty array)
  const getSlotsForDate = (day: number) => {
    const date = currentMonth.date(day)
    if (date.day() === 6) return [] // No slots on Saturday
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
    if (date.day() === 6) return // Don't select Saturday (no slots available)
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
          <div className="grid grid-cols-6 gap-2 mb-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="min-h-[115px] bg-muted animate-pulse rounded-lg" />
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

      {/* Calendar Grid - Monday through Saturday (excluding Sunday) */}
      <div className="space-y-2 mb-4">
        {/* Header row with weekday labels */}
        <div className="grid grid-cols-6 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayLabel) => (
            <div key={dayLabel} className="text-center text-sm font-medium text-muted-foreground p-2">
              {dayLabel}
            </div>
          ))}
        </div>
        
        {/* Calendar weeks - each week is a row */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-6 gap-2">
            {week.map((dayData, dayIndex) => {
              if (!dayData) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="flex-1 min-h-[115px]"></div>
              }
              
              const { day, date } = dayData
              const dateSlots = getSlotsForDate(day)
              const isToday = dayjs().isSame(date, 'day')
              const hasSlots = dateSlots.length > 0
              const dateKey = date.format('YYYY-MM-DD')
              const isSelected = selectedDate === dateKey
              const isWeekend = date.day() === 6 // Saturday

              return (
                <div
                  key={day}
                  className={`flex-1 flex flex-col min-h-[115px] p-2 border-2 rounded-lg transition-all ${
                    isWeekend ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    isToday ? 'bg-primary/20 border-primary shadow-md shadow-primary/20' : 'border-border bg-card'
                  } ${isSelected ? 'ring-2 ring-primary ring-offset-2 bg-primary/10' : ''} ${
                    hasSlots && !isWeekend ? 'hover:bg-muted/50 hover:border-primary/50 hover:shadow-sm' : ''
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {day}
                  </div>
                  <div className="flex-1 flex flex-col justify-start">
                    {isWeekend ? (
                      <div className="text-xs text-muted-foreground/30 italic">Saturday</div>
                    ) : hasSlots ? (
                      <div className="space-y-1">
                        {dateSlots.slice(0, 3).map((slot: Slot) => (
                          <div
                            key={slot.id}
                            className={`text-xs ${getTimeSlotColor(slot)} px-1.5 py-0.5 rounded font-medium`}
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
                </div>
              )
            })}
          </div>
        ))}
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
