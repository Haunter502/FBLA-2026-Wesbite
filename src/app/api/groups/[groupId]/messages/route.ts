import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { groupMessages, groupMembers, users } from '@/lib/schema'
import { eq, and, desc } from '@/lib/drizzle-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth()
    const { groupId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member
    const membership = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.user.id)))
      .limit(1)

    if (membership.length === 0) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Get messages
    const messages = await db
      .select({
        id: groupMessages.id,
        message: groupMessages.message,
        createdAt: groupMessages.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(groupMessages)
      .leftJoin(users, eq(groupMessages.userId, users.id))
      .where(eq(groupMessages.groupId, groupId))
      .orderBy(desc(groupMessages.createdAt))
      .limit(100)

    // Convert createdAt to Unix seconds for consistency
    const messagesWithTimestamp = messages.map((msg: typeof messages[0]) => ({
      ...msg,
      createdAt:
        typeof msg.createdAt === 'number'
          ? msg.createdAt
          : Math.floor(new Date(msg.createdAt).getTime() / 1000),
    }))

    return NextResponse.json(messagesWithTimestamp.reverse())
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

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

    // Check if user is a member
    const membership = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.user.id)))
      .limit(1)

    if (membership.length === 0) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Create message
    const [newMessage] = await db
      .insert(groupMessages)
      .values({
        groupId,
        userId: session.user.id,
        message: message.trim(),
      })
      .returning()

    // Get user info
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    // Convert createdAt to Unix seconds
    const createdAt =
      typeof newMessage.createdAt === 'number'
        ? newMessage.createdAt
        : Math.floor(new Date(newMessage.createdAt).getTime() / 1000)

    return NextResponse.json({
      id: newMessage.id,
      message: newMessage.message,
      createdAt,
      user: user || null,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

