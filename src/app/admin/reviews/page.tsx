import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews, users } from '@/lib/schema'
import { eq, desc } from '@/lib/drizzle-helpers'
import { AdminReviewsClient } from '@/components/admin/reviews-client'
import { ScrollReveal } from '@/components/animations/scroll-reveal'

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Review Management</h1>
          <p className="text-muted-foreground text-lg">
            Review and moderate user-submitted reviews
          </p>
        </div>
      </ScrollReveal>

      <AdminReviewsClient reviews={allReviews} />
    </div>
  )
}


