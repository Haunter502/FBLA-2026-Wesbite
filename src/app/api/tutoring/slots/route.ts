import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tutoringSlots, teachers } from "@/lib/schema"
import { gte, gt, asc, eq, and } from "@/lib/drizzle-helpers"
import dayjs from "dayjs"
import weekday from "dayjs/plugin/weekday"

dayjs.extend(weekday)

// Generate slots for the next 60 days, every other weekday, 3 times a day with rotating teachers
async function generateSlotsIfNeeded() {
  const now = new Date()
  const nowTimestamp = Math.floor(now.getTime() / 1000) // Unix seconds
  
  // Get all teachers
  const allTeachers = await db.select().from(teachers)
  
  if (allTeachers.length === 0) {
    console.log('No teachers found, skipping slot generation')
    return // No teachers to create slots for
  }

  // Check if we have enough slots for the next 30 days
  const thirtyDaysFromNow = dayjs(now).add(30, 'days').startOf('day').unix()
  const existingSlots = await db
    .select()
    .from(tutoringSlots)
    .where(gte(tutoringSlots.start, nowTimestamp))
    .limit(100)

  // Calculate expected slots: ~15 weekdays (every other day in 30 days) * 3 time slots
  // Every other day means: day 0, day 2, day 4, etc. (skip day 1, 3, 5)
  const expectedWeekdays = Math.floor(30 * 5 / 7 / 2) // ~10-11 weekdays (every other)
  const expectedSlots = expectedWeekdays * 3 // 3 sessions per day
  
  // If we have at least 80% of expected slots, don't regenerate
  if (existingSlots.length >= expectedSlots * 0.8) {
    console.log(`Have ${existingSlots.length} slots, expected ~${expectedSlots}, skipping generation`)
    return
  }
  
  // Clear existing future slots to regenerate fresh
  console.log(`Clearing existing future slots and generating new ones...`)
  try {
    await db.delete(tutoringSlots).where(gte(tutoringSlots.start, nowTimestamp as any))
  } catch (error) {
    console.error('Error clearing slots:', error)
  }
  
  // Generate slots for next 60 days, every other weekday
  console.log(`Generating tutoring slots for ${allTeachers.length} teachers...`)

  const newSlots: Array<{
    teacherId: string
    start: number
    end: number
    capacity: number
    spotsLeft: number
  }> = []

  // Time slots: Morning (9 AM), Afternoon (2 PM), Evening (6 PM)
  const timeSlots = [
    { hour: 9, minute: 0, label: 'morning' },
    { hour: 14, minute: 0, label: 'afternoon' },
    { hour: 18, minute: 0, label: 'evening' },
  ]

  // Track weekday count (for every other day logic)
  let weekdayCount = 0
  
  for (let day = 0; day < 60; day++) {
    const date = dayjs(now).add(day, 'day')
    const dayOfWeek = date.day()

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue
    }

    // Only create slots every other weekday
    // weekdayCount 0, 2, 4, 6... (skip 1, 3, 5, 7...)
    if (weekdayCount % 2 !== 0) {
      weekdayCount++
      continue
    }
    
    weekdayCount++

    // Create 3 sessions per day (morning, afternoon, evening) with rotating teachers
    timeSlots.forEach((timeSlot, timeSlotIndex) => {
      // Rotate teachers: each day gets different teachers for each time slot
      // Formula: (weekdayCount/2 + timeSlotIndex) % teacherCount
      // This ensures rotation: Day 0 (weekdayCount=0): teachers 0,1,2; Day 2 (weekdayCount=2): teachers 1,2,0; etc.
      const teacherIndex = (Math.floor(weekdayCount / 2) + timeSlotIndex) % allTeachers.length
      const teacher = allTeachers[teacherIndex]
      
      const start = date.hour(timeSlot.hour).minute(timeSlot.minute).second(0).millisecond(0)
      const end = start.add(1, 'hour')

      // Convert to Unix seconds (schema uses mode: 'timestamp')
      const startUnix = start.unix()
      const endUnix = end.unix()

      newSlots.push({
        teacherId: teacher.id,
        start: startUnix,
        end: endUnix,
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
      console.log(`✓ Generated ${newSlots.length} tutoring slots (every other day, 3 sessions/day, rotating teachers)`)
    } catch (error) {
      console.error('Error inserting slots:', error)
      throw error
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
