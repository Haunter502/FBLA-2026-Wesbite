import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../src/lib/schema'
import { gte, lt, and } from '../src/lib/drizzle-helpers'
import dayjs from 'dayjs'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

// Create database connection
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db'
const sqlite = new Database(dbPath)
const db = drizzle(sqlite, { schema })

async function addNov17Slots() {
  console.log('📅 Adding Morning and Afternoon slots for November 17th, 2025...')

  try {
    // Get all teachers
    const allTeachers = await db.select().from(schema.teachers)
    
    if (allTeachers.length === 0) {
      console.log('❌ No teachers found. Please seed teachers first.')
      return
    }

    console.log(`✓ Found ${allTeachers.length} teachers`)

    // November 17th, 2025 is a Monday
    const nov17 = dayjs('2025-11-17')
    const dayStart = nov17.startOf('day').toDate()
    const dayEnd = nov17.endOf('day').toDate()
    
    // Check if slots already exist for this date
    const existingSlots = await db.select().from(schema.tutoringSlots)
      .where(
        and(
          gte(schema.tutoringSlots.start, dayStart),
          lt(schema.tutoringSlots.start, dayEnd)
        )
      )

    const newSlots: Array<{
      teacherId: string
      start: Date
      end: Date
      capacity: number
      spotsLeft: number
    }> = []

    // Add Morning (9 AM) and Afternoon (2 PM) slots for each teacher
    for (const teacher of allTeachers) {
      // Morning slot: 9 AM - 10 AM
      const morningStart = nov17.hour(9).minute(0).second(0).toDate()
      const morningEnd = nov17.hour(10).minute(0).second(0).toDate()
      
      // Check if morning slot already exists
      const morningExists = existingSlots.some(
        slot => 
          slot.teacherId === teacher.id &&
          dayjs(slot.start).hour() === 9
      )

      if (!morningExists) {
        newSlots.push({
          teacherId: teacher.id,
          start: morningStart,
          end: morningEnd,
          capacity: 5,
          spotsLeft: 5,
        })
        console.log(`  ✓ Added Morning slot for ${teacher.name}`)
      }

      // Afternoon slot: 2 PM - 3 PM
      const afternoonStart = nov17.hour(14).minute(0).second(0).toDate()
      const afternoonEnd = nov17.hour(15).minute(0).second(0).toDate()
      
      // Check if afternoon slot already exists
      const afternoonExists = existingSlots.some(
        slot => 
          slot.teacherId === teacher.id &&
          dayjs(slot.start).hour() === 14
      )

      if (!afternoonExists) {
        newSlots.push({
          teacherId: teacher.id,
          start: afternoonStart,
          end: afternoonEnd,
          capacity: 5,
          spotsLeft: 5,
        })
        console.log(`  ✓ Added Afternoon slot for ${teacher.name}`)
      }
    }

    if (newSlots.length > 0) {
      await db.insert(schema.tutoringSlots).values(newSlots)
      console.log(`✅ Successfully added ${newSlots.length} slots for November 17th, 2025!`)
    } else {
      console.log('ℹ️  All slots for November 17th already exist.')
    }

  } catch (error) {
    console.error('❌ Error adding slots:', error)
    throw error
  } finally {
    sqlite.close()
  }
}

addNov17Slots()
  .then(() => {
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })

