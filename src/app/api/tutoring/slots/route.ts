import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tutoringSlots, teachers } from "@/lib/schema"
import { gte, gt, asc, eq, and } from "@/lib/drizzle-helpers"

export async function GET() {
  try {
    const now = new Date()
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
      .where(and(gte(tutoringSlots.start, now), gt(tutoringSlots.spotsLeft, 0)))
      .orderBy(asc(tutoringSlots.start))
      .limit(10)

    // Normalize timestamps to Unix seconds for consistent handling
    const normalizedSlots = slots.map(slot => ({
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

