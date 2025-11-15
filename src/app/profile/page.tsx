import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from '@/lib/drizzle-helpers'
import { ProfileClient } from '@/components/profile/profile-client'
import { ScrollReveal } from '@/components/animations/scroll-reveal'

async function getUserProfile(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      bio: users.bio,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return user
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/sign-in')
  }

  const user = await getUserProfile(session.user.id)

  if (!user) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground text-lg">
            Manage your profile information and settings
          </p>
        </div>
      </ScrollReveal>

      <ProfileClient user={user} />
    </div>
  )
}


