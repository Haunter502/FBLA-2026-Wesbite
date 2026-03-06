import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from '@/lib/drizzle-helpers'
import { ProfileClient } from '@/components/profile/profile-client'
import { ParticleBackground } from '@/components/animations/particle-background'
import { GodRays } from '@/components/animations/god-rays'
import { FadeInUp } from '@/components/animations/fade-in-up'
import { GradientText } from '@/components/animations/gradient-text'

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <ParticleBackground count={30} />
      <GodRays count={5} />
      <div className="god-rays-css fixed inset-0 pointer-events-none z-0" />
      
      {/* Gradient background with animated blur orbs */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 isolate" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <FadeInUp delay={0.1}>
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <GradientText variant="primary" className="text-5xl md:text-6xl">
                Profile
              </GradientText>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Manage your profile information and settings
            </p>
          </div>
        </FadeInUp>

        <ProfileClient user={user} />
      </div>
    </div>
  )
}


