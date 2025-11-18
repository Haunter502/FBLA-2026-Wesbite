import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { directMessages, users } from '@/lib/schema'
import { eq, and, or, desc } from '@/lib/drizzle-helpers'
import { filterProfanity } from '@/lib/profanity-filter'

// GET: Get messages between current user and another user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    const { userId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get messages between the two users (bidirectional)
    const messages = await db
      .select({
        id: directMessages.id,
        message: directMessages.message,
        createdAt: directMessages.createdAt,
        read: directMessages.read,
        sender: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(directMessages)
      .leftJoin(users, eq(directMessages.senderId, users.id))
      .where(
        or(
          and(
            eq(directMessages.senderId, session.user.id),
            eq(directMessages.receiverId, userId)
          ),
          and(
            eq(directMessages.senderId, userId),
            eq(directMessages.receiverId, session.user.id)
          )
        )
      )
      .orderBy(desc(directMessages.createdAt))
      .limit(100)

    // Mark messages as read if they were sent to current user
    await db
      .update(directMessages)
      .set({ read: true })
      .where(
        and(
          eq(directMessages.receiverId, session.user.id),
          eq(directMessages.senderId, userId),
          eq(directMessages.read, false)
        )
      )

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

// POST: Send a message to another user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    const { userId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Don't allow messaging yourself
    if (session.user.id === userId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    }

    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Filter profanity from message
    const filteredMessage = filterProfanity(message.trim())

    // Create message
    const [newMessage] = await db
      .insert(directMessages)
      .values({
        senderId: session.user.id,
        receiverId: userId,
        message: filteredMessage,
        read: false,
      })
      .returning()

    if (!newMessage) {
      console.error('Failed to create message - no message returned')
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }

    // Get sender info
    const [sender] = await db
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
      read: newMessage.read,
      sender: sender || null,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    return NextResponse.json({ 
      error: 'Failed to send message',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

