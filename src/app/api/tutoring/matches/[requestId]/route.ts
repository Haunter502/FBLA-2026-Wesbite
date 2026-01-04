import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tutoringRequests, tutoringSlots, teachers } from '@/lib/schema'
import { eq } from '@/lib/drizzle-helpers'
import { z } from 'zod'

const responseSchema = z.object({
  action: z.enum(['accept', 'decline', 'reschedule']),
  message: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = await params

    // Get the tutoring request with related data
    const [request] = await db
      .select({
        id: tutoringRequests.id,
        userId: tutoringRequests.userId,
        type: tutoringRequests.type,
        topic: tutoringRequests.topic,
        status: tutoringRequests.status,
        matchedTeacherId: tutoringRequests.matchedTeacherId,
        matchedSlotId: tutoringRequests.matchedSlotId,
        matchStatus: tutoringRequests.matchStatus,
        matchResponse: tutoringRequests.matchResponse,
        createdAt: tutoringRequests.createdAt,
      })
      .from(tutoringRequests)
      .where(eq(tutoringRequests.id, requestId))
      .limit(1)

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Only the student who made the request can view it
    if (request.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get teacher info if matched
    let teacher = null
    if (request.matchedTeacherId) {
      const [teacherData] = await db
        .select({
          id: teachers.id,
          name: teachers.name,
          email: teachers.email,
          bio: teachers.bio,
          officeHours: teachers.officeHours,
        })
        .from(teachers)
        .where(eq(teachers.id, request.matchedTeacherId))
        .limit(1)
      
      teacher = teacherData || null
    }

    // Get slot info if matched to a slot
    let slot = null
    if (request.matchedSlotId) {
      const [slotData] = await db
        .select({
          id: tutoringSlots.id,
          start: tutoringSlots.start,
          end: tutoringSlots.end,
          capacity: tutoringSlots.capacity,
          spotsLeft: tutoringSlots.spotsLeft,
        })
        .from(tutoringSlots)
        .where(eq(tutoringSlots.id, request.matchedSlotId))
        .limit(1)
      
      if (slotData) {
        // Normalize timestamps to Unix seconds for consistent handling
        slot = {
          ...slotData,
          start: typeof slotData.start === 'number' 
            ? (slotData.start < 10000000000 ? slotData.start : Math.floor(slotData.start / 1000))
            : Math.floor(new Date(slotData.start).getTime() / 1000),
          end: typeof slotData.end === 'number' 
            ? (slotData.end < 10000000000 ? slotData.end : Math.floor(slotData.end / 1000))
            : Math.floor(new Date(slotData.end).getTime() / 1000),
        }
      }
    }

    return NextResponse.json({
      request: {
        ...request,
        teacher,
        slot,
      },
    })
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = await params
    const body = await req.json()
    const { action, message } = responseSchema.parse(body)

    // Get the tutoring request
    const [request] = await db
      .select()
      .from(tutoringRequests)
      .where(eq(tutoringRequests.id, requestId))
      .limit(1)

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Only the student who made the request can respond
    if (request.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (request.status !== 'MATCHED' || request.matchStatus !== 'PENDING_ACCEPTANCE') {
      return NextResponse.json(
        { error: 'Request is not awaiting acceptance' },
        { status: 400 }
      )
    }

    // Update based on action
    let updateData: any = {
      matchResponse: message || null,
    }

    if (action === 'accept') {
      updateData.matchStatus = 'ACCEPTED'
      updateData.status = 'MATCHED' // Keep as matched
    } else if (action === 'decline') {
      updateData.matchStatus = 'DECLINED'
      updateData.status = 'PENDING' // Reset to pending so admin can match again
      
      // If there was a slot, increment spots back
      if (request.matchedSlotId) {
        const [slot] = await db
          .select({ spotsLeft: tutoringSlots.spotsLeft })
          .from(tutoringSlots)
          .where(eq(tutoringSlots.id, request.matchedSlotId))
          .limit(1)
        
        if (slot) {
          await db
            .update(tutoringSlots)
            .set({ spotsLeft: slot.spotsLeft + 1 })
            .where(eq(tutoringSlots.id, request.matchedSlotId))
        }
      }

      // Clear the match
      updateData.matchedTeacherId = null
      updateData.matchedSlotId = null
    } else if (action === 'reschedule') {
      updateData.matchStatus = 'RESCHEDULED'
      updateData.status = 'PENDING' // Reset to pending
      
      // If there was a slot, increment spots back
      if (request.matchedSlotId) {
        const [slot] = await db
          .select({ spotsLeft: tutoringSlots.spotsLeft })
          .from(tutoringSlots)
          .where(eq(tutoringSlots.id, request.matchedSlotId))
          .limit(1)
        
        if (slot) {
          await db
            .update(tutoringSlots)
            .set({ spotsLeft: slot.spotsLeft + 1 })
            .where(eq(tutoringSlots.id, request.matchedSlotId))
        }
      }

      // Clear the match
      updateData.matchedTeacherId = null
      updateData.matchedSlotId = null
    }

    await db
      .update(tutoringRequests)
      .set(updateData)
      .where(eq(tutoringRequests.id, requestId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error responding to match:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

