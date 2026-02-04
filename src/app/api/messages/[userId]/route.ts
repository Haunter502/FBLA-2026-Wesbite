import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { directMessages, users, notifications } from '@/lib/schema'
import { eq, and, or, desc } from '@/lib/drizzle-helpers'
import { filterProfanity } from '@/lib/profanity-filter'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const currentUserId = session.user.id

    // Get all messages between current user and the other user
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
            eq(directMessages.senderId, currentUserId),
            eq(directMessages.receiverId, userId)
          ),
          and(
            eq(directMessages.senderId, userId),
            eq(directMessages.receiverId, currentUserId)
          )
        )
      )
      .orderBy(desc(directMessages.createdAt))
      .limit(100)

    // Mark messages as read if they were sent to the current user
    await db
      .update(directMessages)
      .set({ read: true })
      .where(
        and(
          eq(directMessages.receiverId, currentUserId),
          eq(directMessages.senderId, userId),
          eq(directMessages.read, false)
        )
      )

    // Convert createdAt to Unix timestamp
    type MessageRow = (typeof messages)[number]
    const formattedMessages = messages.map((msg: MessageRow) => ({
      id: msg.id,
      message: msg.message,
      createdAt: typeof msg.createdAt === 'number' 
        ? msg.createdAt 
        : Math.floor(new Date(msg.createdAt).getTime() / 1000),
      read: msg.read,
      sender: msg.sender,
    }))

    return NextResponse.json(formattedMessages.reverse()) // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const currentUserId = session.user.id

    // Verify the other user exists
    const [otherUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!otherUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // Filter profanity from message
    const filteredMessage = filterProfanity(message.trim())

    // Create the message
    const [newMessage] = await db
      .insert(directMessages)
      .values({
        senderId: currentUserId,
        receiverId: userId,
        message: filteredMessage,
        read: false,
      })
      .returning()

    // Get sender info
    const [sender] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, currentUserId))
      .limit(1)

    // Create notification for the receiver
    try {
      await db.insert(notifications).values({
        userId: userId,
        type: 'direct_message',
        title: `New message from ${sender?.name || 'Someone'}`,
        message: filteredMessage.length > 100 ? filteredMessage.substring(0, 100) + '...' : filteredMessage,
        link: `/messages/${currentUserId}`,
        read: false,
      })
    } catch (notifError) {
      console.error('Error creating notification:', notifError)
      // Don't fail the message send if notification creation fails
    }

    return NextResponse.json({
      id: newMessage.id,
      message: newMessage.message,
      createdAt: typeof newMessage.createdAt === 'number'
        ? newMessage.createdAt
        : Math.floor(new Date(newMessage.createdAt).getTime() / 1000),
      read: newMessage.read,
      sender: sender || {
        id: currentUserId,
        name: null,
        email: '',
        image: null,
      },
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

