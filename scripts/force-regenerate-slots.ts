import { db } from "../src/lib/db"
import { tutoringSlots, teachers } from "../src/lib/schema"
import { gte } from "../src/lib/drizzle-helpers"
import dayjs from "dayjs"

async function forceRegenerateSlots() {
  console.log("🔄 Force regenerating tutoring slots...")
  
  const now = new Date()
  const nowTimestamp = Math.floor(now.getTime() / 1000)
  
  // Get all teachers
  const allTeachers = await db.select().from(teachers)
  console.log(`Found ${allTeachers.length} teachers`)
  
  if (allTeachers.length === 0) {
    console.log("❌ No teachers found!")
    process.exit(1)
  }
  
  // Delete all future slots
  console.log("Clearing existing future slots...")
  try {
    await db.delete(tutoringSlots).where(gte(tutoringSlots.start, nowTimestamp))
    console.log("✓ Cleared existing future slots")
  } catch (error) {
    console.error("Error clearing slots:", error)
  }
  
  // Generate slots for next 60 days, every other weekday
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
    if (weekdayCount % 2 !== 0) {
      weekdayCount++
      continue
    }
    
    weekdayCount++

    // Create 3 sessions per day - ALL teachers for each time slot
    timeSlots.forEach((timeSlot) => {
      allTeachers.forEach((teacher: typeof teachers.$inferSelect) => {
        const start = date.hour(timeSlot.hour).minute(timeSlot.minute).second(0).millisecond(0)
        const end = start.add(1, 'hour')

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

  if (newSlots.length > 0) {
    try {
      // Insert slots in batches
      const batchSize = 100
      for (let i = 0; i < newSlots.length; i += batchSize) {
        const batch = newSlots.slice(i, i + batchSize)
        await db.insert(tutoringSlots).values(batch)
      }
      console.log(`✅ Generated ${newSlots.length} tutoring slots!`)
      console.log(`   - ${Math.floor(60 * 5 / 7 / 2)} weekdays (every other day)`)
      console.log(`   - 3 time slots per day (morning, afternoon, evening)`)
      console.log(`   - ${allTeachers.length} teachers per time slot`)
    } catch (error) {
      console.error('❌ Error inserting slots:', error)
      throw error
    }
  }
}

forceRegenerateSlots()
  .then(() => {
    console.log("✅ Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })


