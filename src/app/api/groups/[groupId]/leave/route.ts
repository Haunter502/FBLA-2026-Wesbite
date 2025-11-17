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

    // Leave group
    await db
      .delete(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.user.id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving group:', error)
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 })
  }
}


