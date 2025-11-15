import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tutoringSlots, teachers } from "@/lib/schema"
import { gte, gt, asc, eq, and } from "@/lib/drizzle-helpers"
import dayjs from "dayjs"
import weekday from "dayjs/plugin/weekday"

dayjs.extend(weekday)

  // Generate slots for the next 60 days (weekdays only) with rotating teachers
async function generateSlotsIfNeeded() {
  const now = new Date()
  const nowTimestamp = now.getTime() // Milliseconds
  const sixtyDaysFromNow = dayjs(now).add(60, 'days')
  
  // Get all teachers
  const allTeachers = await db.select().from(teachers)
  
  if (allTeachers.length === 0) {
    return // No teachers to create slots for
  }

  // Check if we have slots for the next week
  // If not, generate slots for the next 60 days
  const nextWeekStart = dayjs(now).add(7, 'days').startOf('day').unix()
  const slotsForNextWeek = await db
    .select()
    .from(tutoringSlots)
    .where(gte(tutoringSlots.start, nextWeekStart))
    .limit(1)

  // If we have slots for next week, check if we have enough for 60 days
  if (slotsForNextWeek.length > 0) {
    const allFutureSlots = await db
      .select()
      .from(tutoringSlots)
      .where(gte(tutoringSlots.start, nowTimestamp))
    
    // Calculate expected slots: ~43 weekdays * 3 time slots * number of teachers
    const expectedWeekdays = Math.floor(60 * 5 / 7) // ~43 weekdays in 60 days
    const expectedSlots = expectedWeekdays * 3 * allTeachers.length
    
    // If we have at least 80% of expected slots, don't regenerate
    if (allFutureSlots.length >= expectedSlots * 0.8) {
      return
    }
  }
  
  // If we get here, we need to generate slots
  console.log(`Generating tutoring slots for ${allTeachers.length} teachers...`)

  // Generate slots for next 60 weekdays (more sessions)
  const newSlots: Array<{
    teacherId: string
    start: Date | number
    end: Date | number
    capacity: number
    spotsLeft: number
  }> = []

  // Time slots: Morning (9 AM), Afternoon (2 PM), Evening (6 PM)
  const timeSlots = [
    { hour: 9, minute: 0, label: 'morning' },
    { hour: 14, minute: 0, label: 'afternoon' },
    { hour: 18, minute: 0, label: 'evening' },
  ]

  // Generate slots for each weekday, but only every other day
  let dayIndex = 0 // Track which weekday we're on (for every other day)
  
  for (let day = 0; day < 60; day++) {
    const date = dayjs(now).add(day, 'day')
    const dayOfWeek = date.day()

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue
    }

    // Only create slots every other weekday (dayIndex 0, 2, 4, 6, etc.)
    if (dayIndex % 2 !== 0) {
      dayIndex++
      continue
    }
    
    dayIndex++

    // Create 3 sessions per day (morning, afternoon, evening) with rotating teachers
    // Each time slot gets a different teacher, rotating through all teachers
    timeSlots.forEach((timeSlot, timeSlotIndex) => {
      // Calculate which teacher should teach this time slot
      // Rotates based on dayIndex and time slot index
      // This ensures teachers rotate: Day 0: Teacher 0, 1, 2; Day 2: Teacher 2, 0, 1; etc.
      const teacherIndex = (dayIndex - 1 + timeSlotIndex) % allTeachers.length
      const teacher = allTeachers[teacherIndex]
      
      const start = date.hour(timeSlot.hour).minute(timeSlot.minute).second(0).millisecond(0)
      const end = start.add(1, 'hour')

      newSlots.push({
        teacherId: teacher.id,
        start: start.toDate(), // Date object (milliseconds)
        end: end.toDate(),
        capacity: 5,
        spotsLeft: 5,
      })
    })
  }

  if (newSlots.length > 0) {
    try {
      // Insert slots in batches to avoid issues
      const batchSize = 100
      for (let i = 0; i < newSlots.length; i += batchSize) {
        const batch = newSlots.slice(i, i + batchSize)
        await db.insert(tutoringSlots).values(batch)
      }
      console.log(`✓ Generated ${newSlots.length} tutoring slots`)
    } catch (error) {
      console.error('Error inserting slots:', error)
      // Continue anyway - some slots might already exist
    }
  }
}

export async function GET() {
  try {
    // Generate slots if needed
    await generateSlotsIfNeeded()

    const now = new Date()
    // Schema uses mode: 'timestamp' which stores as Unix seconds
    // Convert now to Unix seconds for comparison
    const nowTimestamp = Math.floor(now.getTime() / 1000)
    
    const slots = await db
      .select({
        id: tutoringSlots.id,
        teacherId: tutoringSlots.teacherId,
        start: tutoringSlots.start,
        end: tutoringSlots.end,
        capacity: tutoringSlots.capacity,
        spotsLeft: tutoringSlots.spotsLeft,
        teacher: {
          name: teachers.name,
          email: teachers.email,
        },
      })
      .from(tutoringSlots)
      .leftJoin(teachers, eq(tutoringSlots.teacherId, teachers.id))
      .where(and(gte(tutoringSlots.start, nowTimestamp), gt(tutoringSlots.spotsLeft, 0)))
      .orderBy(asc(tutoringSlots.start))

    // Convert timestamps to proper format and add time slot label
    // Schema uses mode: 'timestamp' which stores as Unix seconds (integer)
    const formattedSlots = slots.map((slot: typeof slots[0]) => {
      // Handle both Date objects and Unix timestamps (seconds)
      let startTimestamp: number
      if (slot.start instanceof Date) {
        startTimestamp = Math.floor(slot.start.getTime() / 1000) // Convert to seconds
      } else if (typeof slot.start === 'number') {
        // If it's already a number, check if it's seconds or milliseconds
        startTimestamp = slot.start > 1e12 ? Math.floor(slot.start / 1000) : slot.start
      } else {
        startTimestamp = Math.floor(new Date(slot.start).getTime() / 1000)
      }
      
      const startDate = new Date(startTimestamp * 1000)
      const hour = startDate.getHours()
      let timeSlot: 'morning' | 'afternoon' | 'evening' = 'morning'
      if (hour >= 6 && hour < 12) timeSlot = 'morning'
      else if (hour >= 12 && hour < 17) timeSlot = 'afternoon'
      else timeSlot = 'evening'

      let endTimestamp: number
      if (slot.end instanceof Date) {
        endTimestamp = Math.floor(slot.end.getTime() / 1000)
      } else if (typeof slot.end === 'number') {
        endTimestamp = slot.end > 1e12 ? Math.floor(slot.end / 1000) : slot.end
      } else {
        endTimestamp = Math.floor(new Date(slot.end).getTime() / 1000)
      }

      return {
        ...slot,
        start: startTimestamp,
        end: endTimestamp,
        timeSlot,
      }
    })

    return NextResponse.json({ slots: formattedSlots })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}
