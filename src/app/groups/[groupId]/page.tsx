import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { studyGroups, groupMembers, users } from '@/lib/schema'
import { eq, and } from '@/lib/drizzle-helpers'
import { GroupChatClient } from '@/components/group-study/group-chat-client'

async function getGroup(groupId: string, userId: string, userRole: string) {
  // Admins can access any group
  if (userRole !== 'ADMIN') {
    // Check if user is a member
    const membership = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .limit(1)

    if (membership.length === 0) {
      return null
    }
  }

  const [group] = await db
    .select()
    .from(studyGroups)
    .where(eq(studyGroups.id, groupId))
    .limit(1)

  if (!group) return null

  // Get all members
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(groupMembers)
    .leftJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))

  return {
    ...group,
    members: members.map((m: typeof members[0]) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      image: m.image,
    })),
  }
}

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const session = await auth()
  const { groupId } = await params

  if (!session || !session.user?.id) {
    redirect('/auth/sign-in')
  }

  const group = await getGroup(groupId, session.user.id, session.user.role || 'STUDENT')

  if (!group) {
    redirect('/group-study')
  }

  // Convert createdAt to Unix timestamp for consistency
  const groupWithTimestamp = {
    ...group,
    createdAt: typeof group.createdAt === 'number' ? group.createdAt : Math.floor(new Date(group.createdAt).getTime() / 1000),
  }

  return <GroupChatClient group={groupWithTimestamp} currentUserId={session.user.id} />
}


