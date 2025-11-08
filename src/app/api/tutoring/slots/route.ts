import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tutoringSlots, teachers } from "../../../../../drizzle/schema"
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

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}

