import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringRequests } from "../../../../../drizzle/schema"
import { z } from "zod"

const immediateHelpSchema = z.object({
  topic: z.string().min(1),
  userId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { topic, userId } = immediateHelpSchema.parse(body)

    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [request] = await db
      .insert(tutoringRequests)
      .values({
        userId,
        type: "IMMEDIATE",
        topic,
        status: "PENDING",
      })
      .returning()

    return NextResponse.json({ requestId: request.id, success: true })
  } catch (error) {
    console.error("Error creating immediate help request:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}

