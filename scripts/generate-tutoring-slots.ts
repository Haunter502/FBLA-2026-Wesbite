import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../src/lib/schema'
import { gte, eq } from 'drizzle-orm'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

dayjs.extend(weekday)

// Create database connection directly
const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') || './dev.db')
const db = drizzle(sqlite, { schema })

async function generateTutoringSlots() {
  console.log('🎓 Generating tutoring slots...')

  try {
    // Get all teachers
    const allTeachers = await db.select().from(schema.teachers)
    
    if (allTeachers.length === 0) {
      console.log('❌ No teachers found. Please seed teachers first.')
      return
    }

    console.log(`✓ Found ${allTeachers.length} teachers`)

    // Clear existing future slots
    const now = new Date()
    const nowTimestamp = Math.floor(now.getTime() / 1000) // Unix seconds
    
    const existingSlots = await db.select().from(schema.tutoringSlots)
      .where(gte(schema.tutoringSlots.start, nowTimestamp))
    
    if (existingSlots.length > 0) {
      console.log(`🗑️  Clearing ${existingSlots.length} existing future slots...`)
      for (const slot of existingSlots) {
        await db.delete(schema.tutoringSlots).where(eq(schema.tutoringSlots.id, slot.id))
      }
    }

    // Generate slots for the next 60 days, every other weekday
    const newSlots: Array<{
      teacherId: string
      start: Date
      end: Date
      capacity: number
      spotsLeft: number
    }> = []

    let dayIndex = 0
    let weekdayCount = 0

    while (weekdayCount < 60) {
      const currentDate = dayjs().add(dayIndex, 'day')
      const dayOfWeek = currentDate.day() // 0 = Sunday, 6 = Saturday

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Only add slots every other weekday
        if (weekdayCount % 2 === 0) {
          const timeSlots = [
            { label: 'Morning', hour: 9 },
            { label: 'Afternoon', hour: 14 },
            { label: 'Evening', hour: 18 },
          ]

          // Rotate teachers through time slots
          timeSlots.forEach((timeSlot, timeSlotIndex) => {
            // Calculate which teacher should teach this slot
            const teacherIndex = (weekdayCount + timeSlotIndex) % allTeachers.length
            const teacher = allTeachers[teacherIndex]

            const start = currentDate.hour(timeSlot.hour).minute(0).second(0).toDate()
            const end = currentDate.hour(timeSlot.hour + 1).minute(0).second(0).toDate()

            newSlots.push({
              teacherId: teacher.id,
              start,
              end,
              capacity: 5,
              spotsLeft: 5,
            })
          })
        }
        weekdayCount++
      }
      dayIndex++
    }

    console.log(`📅 Generated ${newSlots.length} slots for ${weekdayCount} weekdays`)

    // Insert slots in batches
    const batchSize = 50
    for (let i = 0; i < newSlots.length; i += batchSize) {
      const batch = newSlots.slice(i, i + batchSize)
      await db.insert(schema.tutoringSlots).values(batch)
      console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newSlots.length / batchSize)}`)
    }

    console.log('✅ Successfully generated all tutoring slots!')
  } catch (error) {
    console.error('❌ Error generating tutoring slots:', error)
    throw error
  } finally {
    sqlite.close()
  }
}

generateTutoringSlots()
  .then(() => {
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
