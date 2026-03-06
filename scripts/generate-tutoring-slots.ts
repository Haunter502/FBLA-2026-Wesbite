import 'dotenv/config'
import { getDbSync } from '../src/lib/db-server'
import * as schema from '../drizzle/schema'
import { gte, inArray } from 'drizzle-orm'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'

dayjs.extend(weekday)

const db = getDbSync()

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

    // Skip clearing existing slots for now - just add new ones
    console.log('Skipping deletion of existing slots - will add new ones')

    // Generate slots for the next 60 days, every other weekday
    console.log('Generating slot data...')
    const newSlots: Array<{
      teacherId: string
      start: Date
      end: Date
      capacity: number
      spotsLeft: number
    }> = []

    let dayIndex = 0
    let weekdayCount = 0
    const maxDays = 200 // Safety limit to prevent infinite loops

    while (weekdayCount < 60 && dayIndex < maxDays) {
      const currentDate = dayjs().add(dayIndex, 'day')
      const dayOfWeek = currentDate.day() // 0 = Sunday, 6 = Saturday

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Only add slots every other weekday (when weekdayCount is even: 0, 2, 4, 6...)
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

            const startDate = currentDate.hour(timeSlot.hour).minute(0).second(0).toDate()
            const endDate = currentDate.hour(timeSlot.hour + 1).minute(0).second(0).toDate()

            newSlots.push({
              teacherId: teacher.id,
              start: startDate,
              end: endDate,
              capacity: 5,
              spotsLeft: 5,
            })
          })
          
          if ((weekdayCount / 2 + 1) % 10 === 0) {
            console.log(`  Generated slots for ${weekdayCount / 2 + 1} slot-days (day ${dayIndex})...`)
          }
        }
        weekdayCount++ // Increment for every weekday we encounter
      }
      dayIndex++
      if (dayIndex % 30 === 0) {
        console.log(`  Processed ${dayIndex} days, found ${weekdayCount} weekdays so far...`)
      }
    }
    
    if (dayIndex >= maxDays) {
      console.warn(`⚠️  Reached max days limit (${maxDays}) before finding 60 weekdays. Found ${weekdayCount} weekdays.`)
    }

    console.log(`📅 Generated ${newSlots.length} slots for ${weekdayCount} weekdays`)
    console.log('Starting to insert slots...')

    // Insert slots in batches
    const batchSize = 50
    const totalBatches = Math.ceil(newSlots.length / batchSize)
    console.log(`Will insert ${totalBatches} batches of up to ${batchSize} slots each`)
    
    for (let i = 0; i < newSlots.length; i += batchSize) {
      const batch = newSlots.slice(i, i + batchSize)
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${totalBatches} (${batch.length} slots)...`)
      await db.insert(schema.tutoringSlots).values(batch)
      console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${totalBatches}`)
    }

    console.log('✅ Successfully generated all tutoring slots!')
  } catch (error) {
    console.error('❌ Error generating tutoring slots:', error)
    throw error
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
