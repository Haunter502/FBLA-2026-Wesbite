import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews, users, teachers } from '@/lib/schema'
import { eq, desc } from '@/lib/drizzle-helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { FadeInUp } from '@/components/animations/fade-in-up'
import { GlowEffect } from '@/components/animations/glow-effect'
import { GradientText } from '@/components/animations/gradient-text'
import { ParticleBackground } from '@/components/animations/particle-background'
import { ReviewForm } from '@/components/reviews/review-form'
import { ReviewsList } from '@/components/reviews/reviews-list'
import { Star } from 'lucide-react'

async function getReviewStats() {
  const allReviews = await db
    .select({
      rating: reviews.rating,
    })
    .from(reviews)
    .where(eq(reviews.moderated, true))

  if (allReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
  }

  const totalRating = allReviews.reduce((sum: number, r: typeof allReviews[0]) => sum + r.rating, 0)
  const averageRating = totalRating / allReviews.length

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  allReviews.forEach((r: typeof allReviews[0]) => {
    ratingDistribution[r.rating as keyof typeof ratingDistribution]++
  })

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: allReviews.length,
    ratingDistribution,
  }
}

async function getReviews() {
  return await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
      userImage: users.image,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.moderated, true))
    .orderBy(desc(reviews.createdAt))
}

async function getTeachers() {
  return await db
    .select()
    .from(teachers)
    .orderBy(teachers.name)
}

export default async function ReviewsPage() {
  const session = await auth()
  const [reviewsList, stats, teachersList] = await Promise.all([
    getReviews(),
    getReviewStats(),
    getTeachers(),
  ])

  return (
    <div className="relative min-h-screen">
      <ParticleBackground count={20} />
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <FadeInUp delay={0.1}>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <GradientText variant="primary" className="text-5xl md:text-6xl">
                  Reviews
                </GradientText>
              </h1>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <p className="text-muted-foreground text-lg">
                Share your experience and see what others are saying
              </p>
            </FadeInUp>
          </div>
        </ScrollReveal>

      {/* Stats */}
      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlowEffect intensity="medium">
            <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
              </CardContent>
            </Card>
          </GlowEffect>

          <GlowEffect intensity="medium">
            <Card className="bg-gradient-to-br from-green-500/5 via-background to-background border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-lg hover:shadow-green-500/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.totalReviews}</div>
                <p className="text-xs text-muted-foreground mt-1">Verified reviews</p>
              </CardContent>
            </Card>
          </GlowEffect>

          <GlowEffect intensity="medium">
            <Card className="bg-gradient-to-br from-blue-500/5 via-background to-background border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rating Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2 text-xs">
                      <span className="w-8">{rating}★</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-muted-foreground w-8 text-right">
                        {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </GlowEffect>
        </div>
      </ScrollReveal>

      {/* Review Form */}
      {session && (
        <FadeInUp delay={0.2}>
          <GlowEffect intensity="low">
            <ReviewForm teachers={teachersList} />
          </GlowEffect>
        </FadeInUp>
      )}

      {/* Reviews List */}
      <FadeInUp delay={0.3}>
        <ReviewsList reviews={reviewsList} />
      </FadeInUp>
      </div>
    </div>
  )
}

