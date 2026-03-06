import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringRequests } from "@/lib/schema"
import { eq } from "@/lib/drizzle-helpers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    // Only allow admins and teachers
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Delete the tutoring request
    await db
      .delete(tutoringRequests)
      .where(eq(tutoringRequests.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tutoring request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
