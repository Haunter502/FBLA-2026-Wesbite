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

    // Generate slots for the next 60 days, Mondays/Wednesdays/Fridays only
    console.log('Generating slot data...')
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

    let rotationIndex = 0

    for (let day = 0; day < 60; day++) {
      const currentDate = dayjs().add(day, 'day')
      const dayOfWeek = currentDate.day() // 0 = Sunday, 6 = Saturday

      // Only create slots on Monday (1), Wednesday (3), and Friday (5)
      if (dayOfWeek !== 1 && dayOfWeek !== 3 && dayOfWeek !== 5) {
        continue
      }

      const teacherCount = allTeachers.length

      timeSlots.forEach((timeSlot, timeSlotIndex) => {
        const teacherIndex = (rotationIndex + timeSlotIndex) % teacherCount
        const teacher = allTeachers[teacherIndex]

        const startDate = currentDate
          .hour(timeSlot.hour)
          .minute(timeSlot.minute)
          .second(0)
          .millisecond(0)
          .toDate()
        const endDate = dayjs(startDate).add(1, 'hour').toDate()

        newSlots.push({
          teacherId: teacher.id,
          start: startDate,
          end: endDate,
          capacity: 5,
          spotsLeft: 5,
        })
      })

      rotationIndex = (rotationIndex + 1) % teacherCount
    }

    console.log(`📅 Generated ${newSlots.length} slots for upcoming Mondays, Wednesdays, and Fridays`)
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
