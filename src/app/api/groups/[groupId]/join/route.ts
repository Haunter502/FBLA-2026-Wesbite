import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { groupMembers } from '@/lib/schema'
import { eq, and } from '@/lib/drizzle-helpers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth()
    const { groupId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already a member
    const existing = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.user.id)))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    // Join group
    await db.insert(groupMembers).values({
      groupId,
      userId: session.user.id,
      role: 'MEMBER',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error joining group:', error)
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 })
  }
}


