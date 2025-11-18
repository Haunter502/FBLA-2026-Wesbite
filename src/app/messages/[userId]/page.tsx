import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from '@/lib/drizzle-helpers'
import { DirectChatClient } from '@/components/group-study/direct-chat-client'

async function getOtherUser(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      bio: users.bio,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user || null
}

export default async function DirectMessagePage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await auth()
  const { userId } = await params

  if (!session || !session.user?.id) {
    redirect('/auth/sign-in')
  }

  // Don't allow messaging yourself
  if (session.user.id === userId) {
    redirect('/group-study')
  }

  const otherUser = await getOtherUser(userId)

  if (!otherUser) {
    redirect('/group-study')
  }

  return <DirectChatClient otherUser={otherUser} currentUserId={session.user.id} />
}

