import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { directMessages, tutoringRequests, groupMessages, groupMembers } from '@/lib/schema'
import { eq, and, or } from '@/lib/drizzle-helpers'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get unread direct messages
    const unreadMessages = await db
      .select({
        id: directMessages.id,
        message: directMessages.message,
        createdAt: directMessages.createdAt,
        senderId: directMessages.senderId,
      })
      .from(directMessages)
      .where(and(
        eq(directMessages.receiverId, userId),
        eq(directMessages.read, false)
      ))
      .limit(10)

    // Get pending tutoring requests
    const pendingTutoringRequests = await db
      .select({
        id: tutoringRequests.id,
        type: tutoringRequests.type,
        topic: tutoringRequests.topic,
        status: tutoringRequests.status,
        createdAt: tutoringRequests.createdAt,
      })
      .from(tutoringRequests)
      .where(and(
        eq(tutoringRequests.userId, userId),
        eq(tutoringRequests.status, 'PENDING')
      ))
      .limit(5)

    // Get recent group messages (messages in groups the user is part of, from last 24 hours)
    // Note: Simplified for now - can be enhanced later
    let recentGroupMessages: any[] = []
    try {
      const userGroups = await db
        .select({ groupId: groupMembers.groupId })
        .from(groupMembers)
        .where(eq(groupMembers.userId, userId))

      const groupIds = userGroups.map((ug: typeof userGroups[0]) => ug.groupId)
      
      if (groupIds.length > 0) {
        // For now, skip group messages to avoid complex query
        // Can be enhanced later with proper filtering
        recentGroupMessages = []
      }
    } catch (error) {
      // Group messages might not be available, skip them
      console.log('Group messages not available:', error)
    }

    // Format notifications
    const notifications = [
      ...unreadMessages.map((msg: typeof unreadMessages[0]) => ({
        id: `dm-${msg.id}`,
        type: 'direct_message' as const,
        title: 'New Message',
        message: msg.message,
        createdAt: typeof msg.createdAt === 'number' ? msg.createdAt : Math.floor(new Date(msg.createdAt).getTime() / 1000),
        link: `/messages/${msg.senderId}`,
      })),
      ...pendingTutoringRequests.map((req: typeof pendingTutoringRequests[0]) => ({
        id: `tutoring-${req.id}`,
        type: 'tutoring_request' as const,
        title: 'Tutoring Request Pending',
        message: req.topic ? `Request: ${req.topic}` : 'Your tutoring request is being processed',
        createdAt: typeof req.createdAt === 'number' ? req.createdAt : Math.floor(new Date(req.createdAt).getTime() / 1000),
        link: '/tutoring',
      })),
      ...recentGroupMessages.map((msg: typeof recentGroupMessages[0]) => ({
        id: `group-${msg.id}`,
        type: 'group_message' as const,
        title: 'New Group Message',
        message: msg.message,
        createdAt: typeof msg.createdAt === 'number' ? msg.createdAt : Math.floor(new Date(msg.createdAt).getTime() / 1000),
        link: `/groups/${msg.groupId}`,
      })),
    ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10) // Sort by newest, limit to 10

    const unreadCount = unreadMessages.length

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

