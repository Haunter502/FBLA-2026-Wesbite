import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tutoringSlots, teachers } from "@/lib/schema"
import { gte, lte, gt, asc, eq, and } from "@/lib/drizzle-helpers"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const windowEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
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
      .where(
        and(
          gte(tutoringSlots.start, now),
          lte(tutoringSlots.start, windowEnd),
          gt(tutoringSlots.spotsLeft, 0)
        )
      )
      .orderBy(asc(tutoringSlots.start))
      .limit(60)

    // Normalize timestamps to Unix seconds for consistent handling
    type SlotRow = (typeof slots)[number]
    const normalizedSlots = slots.map((slot: SlotRow) => ({
      ...slot,
      start: typeof slot.start === 'number'
        ? (slot.start < 10000000000 ? slot.start : Math.floor(slot.start / 1000))
        : Math.floor(new Date(slot.start).getTime() / 1000),
      end: typeof slot.end === 'number'
        ? (slot.end < 10000000000 ? slot.end : Math.floor(slot.end / 1000))
        : Math.floor(new Date(slot.end).getTime() / 1000),
    }))

    return NextResponse.json({ slots: normalizedSlots })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}

