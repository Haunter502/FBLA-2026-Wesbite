import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { contacts } from "@/lib/schema"
import { eq } from "@/lib/drizzle-helpers"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    // Only admins and teachers can mark contacts as responded
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [updated] = await db
      .update(contacts)
      .set({
        responded: true,
        read: true, // Also mark as read when responding
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, contact: updated })
  } catch (error) {
    console.error("Error marking contact as responded:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

