import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews, users } from '@/lib/schema'
import { eq, desc } from '@/lib/drizzle-helpers'
import { AdminReviewsClient } from '@/components/admin/reviews-client'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { MessageSquare } from 'lucide-react'
import { GradientText } from '@/components/animations/gradient-text'
import { FadeInUp } from '@/components/animations/fade-in-up'

async function getAllReviews() {
  return await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      moderated: reviews.moderated,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt))
}

export default async function AdminReviewsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const allReviews = await getAllReviews()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header */}
        <ScrollReveal>
          <FadeInUp delay={0.1}>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/30">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Review Management
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Review and moderate user-submitted reviews
                  </p>
                </div>
              </div>
            </div>
          </FadeInUp>
        </ScrollReveal>

        <AdminReviewsClient reviews={allReviews} />
      </div>
    </div>
  )
}


