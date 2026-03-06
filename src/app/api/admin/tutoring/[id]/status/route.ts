import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringRequests } from "@/lib/schema"
import { eq } from "@/lib/drizzle-helpers"
import { z } from "zod"

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'MATCHED', 'COMPLETED', 'CANCELLED']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    // Only admins and teachers can update request status
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = updateStatusSchema.parse(body)

    const [updated] = await db
      .update(tutoringRequests)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(tutoringRequests.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, request: updated })
  } catch (error) {
    console.error("Error updating request status:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

