import "dotenv/config"
import { getDbSync } from "../src/lib/db-server"
import { tutoringSlots, teachers } from "../src/lib/schema"
import { gte } from "../src/lib/drizzle-helpers"
import dayjs from "dayjs"

const db = getDbSync()

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
    await db.delete(tutoringSlots).where(gte(tutoringSlots.start, now))
    console.log("✓ Cleared existing future slots")
  } catch (error) {
    console.error("Error clearing slots:", error)
  }

  // Generate slots for next 60 days, Mondays/Wednesdays/Fridays only
  const newSlots: Array<{
    teacherId: string
    start: Date
    end: Date
    capacity: number
    spotsLeft: number
  }> = []

  // Time slots: Morning (9–10 AM), Afternoon (1:30–2:30 PM), Evening (6–7 PM)
  const timeSlots = [
    { label: 'morning', hour: 9, minute: 0 },
    { label: 'afternoon', hour: 13, minute: 30 },
    { label: 'evening', hour: 18, minute: 0 },
  ]

  // Track rotation index so teachers rotate across time slots each tutoring day
  let rotationIndex = 0

  for (let day = 0; day < 60; day++) {
    const date = dayjs(now).add(day, 'day')
    const dayOfWeek = date.day()

    // Only create slots on Monday (1), Wednesday (3), and Friday (5)
    if (dayOfWeek !== 1 && dayOfWeek !== 3 && dayOfWeek !== 5) {
      continue
    }

    const teacherCount = allTeachers.length

    // Create exactly 3 sessions per tutoring day - one teacher per time slot, rotated
    timeSlots.forEach((timeSlot, timeSlotIndex) => {
      const teacherIndex = (rotationIndex + timeSlotIndex) % teacherCount
      const teacher = allTeachers[teacherIndex] as typeof teachers.$inferSelect

      const start = date
        .hour(timeSlot.hour)
        .minute(timeSlot.minute)
        .second(0)
        .millisecond(0)
      const end = start.add(1, 'hour')

      newSlots.push({
        teacherId: teacher.id,
        start: start.toDate(),
        end: end.toDate(),
        capacity: 5,
        spotsLeft: 5,
      })
    })

    // Move rotation forward for the next tutoring day
    rotationIndex = (rotationIndex + 1) % teacherCount
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
      console.log(`   - Up to 60 days of Mondays, Wednesdays, and Fridays`)
      console.log(`   - 3 time slots per tutoring day (morning, afternoon, evening)`)
      console.log(`   - Teachers rotated across time slots each tutoring day`)
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


