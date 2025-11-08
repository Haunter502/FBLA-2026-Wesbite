import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringSlots, tutoringRequests } from "../../../../../drizzle/schema"
import { z } from "zod"
import { eq } from "@/lib/drizzle-helpers"

const bookSchema = z.object({
  slotId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { slotId } = bookSchema.parse(body)

    const [slot] = await db.select().from(tutoringSlots).where(eq(tutoringSlots.id, slotId)).limit(1)

    if (!slot || slot.spotsLeft === 0) {
      return NextResponse.json({ error: "Slot not available" }, { status: 400 })
    }

    // Create tutoring request
    await db.insert(tutoringRequests).values({
      userId: session.user.id,
      type: "SCHEDULED",
      scheduledSlotId: slotId,
      status: "MATCHED",
    })

    // Update slot
    await db
      .update(tutoringSlots)
      .set({ spotsLeft: slot.spotsLeft - 1 })
      .where(eq(tutoringSlots.id, slotId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error booking slot:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to book slot" }, { status: 500 })
  }
}

