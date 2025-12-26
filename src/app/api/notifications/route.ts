import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifications } from '@/lib/schema'
import { eq, desc, and } from '@/lib/drizzle-helpers'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get all notifications for the user
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50)

    // Count unread notifications
    const unreadCount = allNotifications.filter(n => !n.read).length

    // Format notifications for the frontend
    const formattedNotifications = allNotifications.map((notification) => ({
      id: notification.id,
      type: notification.type as 'direct_message' | 'tutoring_request' | 'group_message',
      title: notification.title,
      message: notification.message,
      link: notification.link || '',
      createdAt: typeof notification.createdAt === 'number'
        ? notification.createdAt
        : Math.floor(new Date(notification.createdAt).getTime() / 1000),
      read: notification.read,
    }))

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { notificationId, read, markAllAsRead } = body

    // Mark all as read
    if (markAllAsRead === true) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, session.user.id),
            eq(notifications.read, false)
          )
        )

      return NextResponse.json({ success: true })
    }

    // Mark single notification as read
    if (!notificationId || typeof read !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Update notification read status
    await db
      .update(notifications)
      .set({ read })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id)
        )
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

