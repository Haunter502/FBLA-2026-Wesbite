import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { studyGroups, groupMembers } from '@/lib/schema'
import { eq } from '@/lib/drizzle-helpers'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, memberIds = [] } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    // Create the group
    const [newGroup] = await db
      .insert(studyGroups)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: session.user.id,
      })
      .returning()

    // Add creator as admin
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: session.user.id,
      role: 'ADMIN',
    })

    // Add selected members
    if (memberIds.length > 0) {
      await db.insert(groupMembers).values(
        memberIds.map((memberId: string) => ({
          groupId: newGroup.id,
          userId: memberId,
          role: 'MEMBER',
        }))
      )
    }

    return NextResponse.json({ success: true, group: newGroup })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}


