import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tutoringSlots, teachers } from "@/lib/schema"
import { gte, gt, asc, eq, and } from "@/lib/drizzle-helpers"
import dayjs from "dayjs"
import weekday from "dayjs/plugin/weekday"

dayjs.extend(weekday)

// Generate slots for the next 90 days, every weekday, 6 times a day with all teachers
async function generateSlotsIfNeeded() {
  console.log('[SLOT GEN] Function called')
  const now = new Date()
  const nowTimestamp = Math.floor(now.getTime() / 1000) // Unix seconds
  
  // Get all teachers
  const allTeachers = await db.select().from(teachers)
  console.log(`[SLOT GEN] Found ${allTeachers.length} teachers`)
  
  if (allTeachers.length === 0) {
    console.log('[SLOT GEN] No teachers found, skipping slot generation')
    return // No teachers to create slots for
  }

  // Check if we have enough slots for the next 60 days
  const sixtyDaysFromNow = dayjs(now).add(60, 'days').startOf('day').unix()
  const existingSlots = await db
    .select()
    .from(tutoringSlots)
    .where(gte(tutoringSlots.start, nowTimestamp))
    .limit(500)

  // Calculate expected slots: ~85 weekdays (every weekday in 120 days) * 6 time slots * number of teachers
  const expectedWeekdays = Math.floor(120 * 5 / 7) // ~85 weekdays
  const expectedSlots = expectedWeekdays * 6 * allTeachers.length // 6 sessions per day per teacher
  
  // Always regenerate to ensure we have slots for all teachers
  // Clear existing future slots to regenerate fresh
  console.log(`Clearing existing future slots (had ${existingSlots.length}, expected ~${expectedSlots}) and generating new ones...`)
  try {
    await db.delete(tutoringSlots).where(gte(tutoringSlots.start, nowTimestamp))
    console.log('✓ Cleared existing future slots')
  } catch (error) {
    console.error('Error clearing slots:', error)
  }
  
  // Generate slots for next 60 days, every other weekday
  console.log(`[SLOT GEN] Generating tutoring slots for ${allTeachers.length} teachers...`)

  const newSlots: Array<{
    teacherId: string
    start: number
    end: number
    capacity: number
    spotsLeft: number
  }> = []

  // Time slots: More time slots throughout the day
  const timeSlots = [
    { hour: 9, minute: 0, label: 'morning' },
    { hour: 11, minute: 0, label: 'morning' },
    { hour: 14, minute: 0, label: 'afternoon' },
    { hour: 16, minute: 0, label: 'afternoon' },
    { hour: 18, minute: 0, label: 'evening' },
    { hour: 20, minute: 0, label: 'evening' },
  ]

  // Track weekday count (for every other day logic)
  let weekdayCount = 0
  
  // Extend to 120 days for more slots
  for (let day = 0; day < 120; day++) {
    const date = dayjs(now).add(day, 'day')
    const dayOfWeek = date.day()

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue
    }

    // Create slots for EVERY weekday (not every other day)
    weekdayCount++

    // Create sessions per day - ALL teachers for each time slot
    timeSlots.forEach((timeSlot, timeSlotIndex) => {
      // Create a slot for EACH teacher (not rotating, all teachers available)
      allTeachers.forEach((teacher: typeof teachers.$inferSelect) => {
      
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
    })
  }

  console.log(`[SLOT GEN] Generated ${newSlots.length} slots in memory`)
  
  if (newSlots.length > 0) {
    try {
      console.log(`[SLOT GEN] Inserting ${newSlots.length} slots in batches...`)
      // Insert slots in batches to avoid issues
      const batchSize = 100
      const totalBatches = Math.ceil(newSlots.length / batchSize)
      for (let i = 0; i < newSlots.length; i += batchSize) {
        const batch = newSlots.slice(i, i + batchSize)
        await db.insert(tutoringSlots).values(batch)
        console.log(`[SLOT GEN] Inserted batch ${Math.floor(i / batchSize) + 1}/${totalBatches} (${batch.length} slots)`)
      }
      console.log(`[SLOT GEN] ✅ Successfully generated ${newSlots.length} tutoring slots (every weekday, 6 sessions/day, ALL teachers per time slot)`)
    } catch (error) {
      console.error('[SLOT GEN] ❌ Error inserting slots:', error)
      throw error
    }
  } else {
    console.log('[SLOT GEN] ⚠️  No slots to insert (newSlots.length = 0)')
  }
}

export async function GET() {
  try {
    // Generate slots if needed
    console.log('[API] Starting GET /api/tutoring/slots')
    try {
      await generateSlotsIfNeeded()
      console.log('[API] Finished generateSlotsIfNeeded')
    } catch (genError) {
      console.error('[API] Error in generateSlotsIfNeeded:', genError)
      // Continue anyway to return existing slots
    }

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
    // Drizzle may return Date objects or numbers, but JSON serialization converts Dates to ISO strings
    console.log(`Formatting ${slots.length} slots...`)
    const formattedSlots = slots.map((slot: typeof slots[0]) => {
      try {
        // Handle Unix timestamps (seconds) - schema stores as integer Unix seconds
        let startTimestamp: number
        const startValue = slot.start
        
        if (typeof startValue === 'number') {
          // If it's a number, check if it's seconds or milliseconds
          startTimestamp = startValue > 1e12 ? Math.floor(startValue / 1000) : startValue
        } else if (startValue instanceof Date) {
          startTimestamp = Math.floor(startValue.getTime() / 1000)
        } else {
          // It's likely a string (ISO date) from JSON serialization
          const dateObj = new Date(startValue as any)
          startTimestamp = isNaN(dateObj.getTime()) ? 0 : Math.floor(dateObj.getTime() / 1000)
        }
        
        const startDate = new Date(startTimestamp * 1000)
        const hour = startDate.getHours()
        let timeSlot: 'morning' | 'afternoon' | 'evening' = 'morning'
        if (hour >= 6 && hour < 12) timeSlot = 'morning'
        else if (hour >= 12 && hour < 17) timeSlot = 'afternoon'
        else timeSlot = 'evening'

        let endTimestamp: number
        const endValue = slot.end
        if (typeof endValue === 'number') {
          endTimestamp = endValue > 1e12 ? Math.floor(endValue / 1000) : endValue
        } else if (endValue instanceof Date) {
          endTimestamp = Math.floor(endValue.getTime() / 1000)
        } else {
          // It's likely a string (ISO date) from JSON serialization
          const dateObj = new Date(endValue as any)
          endTimestamp = isNaN(dateObj.getTime()) ? 0 : Math.floor(dateObj.getTime() / 1000)
        }

        return {
          id: slot.id,
          teacherId: slot.teacherId,
          start: startTimestamp, // Return as number (Unix seconds)
          end: endTimestamp, // Return as number (Unix seconds)
          capacity: slot.capacity,
          spotsLeft: slot.spotsLeft,
          teacher: slot.teacher,
          timeSlot,
        }
      } catch (error) {
        console.error('Error formatting slot:', error, slot)
        return {
          id: slot.id,
          teacherId: slot.teacherId,
          start: 0,
          end: 0,
          capacity: slot.capacity,
          spotsLeft: slot.spotsLeft,
          teacher: slot.teacher,
          timeSlot: 'morning' as const,
        }
      }
    })

    return NextResponse.json({ slots: formattedSlots })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json({ slots: [], error: "Failed to fetch slots" })
  }
}
