import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tutoringRequests, notifications, tutoringSlots, teachers } from '@/lib/schema'
import { eq, and } from '@/lib/drizzle-helpers'
import { z } from 'zod'

const matchSchema = z.object({
  requestId: z.string(),
  teacherId: z.string().optional(),
  slotId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and teachers can match students
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { requestId, teacherId, slotId } = matchSchema.parse(body)

    // At least one must be provided
    if (!teacherId && !slotId) {
      return NextResponse.json(
        { error: 'Either teacherId or slotId must be provided' },
        { status: 400 }
      )
    }

    // Get the tutoring request
    const [request] = await db
      .select()
      .from(tutoringRequests)
      .where(eq(tutoringRequests.id, requestId))
      .limit(1)

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request is not pending' },
        { status: 400 }
      )
    }

    // If slotId is provided, verify it exists and get teacher info
    let matchedTeacherId = teacherId
    if (slotId) {
      const [slot] = await db
        .select({
          id: tutoringSlots.id,
          teacherId: tutoringSlots.teacherId,
          start: tutoringSlots.start,
          end: tutoringSlots.end,
          spotsLeft: tutoringSlots.spotsLeft,
        })
        .from(tutoringSlots)
        .where(eq(tutoringSlots.id, slotId))
        .limit(1)

      if (!slot) {
        return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
      }

      if (slot.spotsLeft <= 0) {
        return NextResponse.json(
          { error: 'Slot is full' },
          { status: 400 }
        )
      }

      matchedTeacherId = slot.teacherId

      // Decrement spots left
      await db
        .update(tutoringSlots)
        .set({ spotsLeft: slot.spotsLeft - 1 })
        .where(eq(tutoringSlots.id, slotId))
    } else if (teacherId) {
      // Verify teacher exists
      const [teacher] = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, teacherId))
        .limit(1)

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
      }
    }

    // Update the tutoring request
    await db
      .update(tutoringRequests)
      .set({
        status: 'MATCHED',
        matchedTeacherId: matchedTeacherId || null,
        matchedSlotId: slotId || null,
        matchStatus: 'PENDING_ACCEPTANCE',
      })
      .where(eq(tutoringRequests.id, requestId))

    // Get teacher info for notification
    let teacherName = 'A teacher'
    if (matchedTeacherId) {
      const [teacher] = await db
        .select({ name: teachers.name })
        .from(teachers)
        .where(eq(teachers.id, matchedTeacherId))
        .limit(1)
      
      if (teacher) {
        teacherName = teacher.name
      }
    }

    // Create notification for the student
    await db.insert(notifications).values({
      userId: request.userId,
      type: 'tutoring_request',
      title: 'Tutoring Session Match',
      message: slotId
        ? `You've been matched with ${teacherName} for a tutoring session. Please accept or decline.`
        : `You've been matched with ${teacherName} for immediate help. Please accept or decline.`,
      link: `/tutoring/matches/${requestId}`,
      read: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error matching tutoring request:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

