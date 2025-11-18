import { db } from "@/lib/db"
import { teachers, reviews, users } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Clock, Star } from "lucide-react"
import { asc, eq, desc, and, isNotNull } from "@/lib/drizzle-helpers"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { GradientText } from "@/components/animations/gradient-text"
import { GlassCard } from "@/components/animations/glass-card"
import { GlowEffect } from "@/components/animations/glow-effect"
import { ParticleBackground } from "@/components/animations/particle-background"
import { FadeInUp } from "@/components/animations/fade-in-up"

async function getTeachers() {
  const allTeachers = await db.select().from(teachers).orderBy(asc(teachers.name))
  
  // Get reviews for each teacher
  const teachersWithReviews = await Promise.all(
    allTeachers.map(async (teacher: typeof allTeachers[0]) => {
      const teacherReviews = await db
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
        .where(and(
          eq(reviews.teacherId, teacher.id),
          eq(reviews.moderated, true)
        ))
        .orderBy(desc(reviews.createdAt))
        .limit(5)

      // Calculate average rating
      const averageRating = teacherReviews.length > 0
        ? teacherReviews.reduce((sum: number, r: typeof teacherReviews[0]) => sum + r.rating, 0) / teacherReviews.length
        : null

      return {
        ...teacher,
        reviews: teacherReviews,
        averageRating,
        reviewCount: teacherReviews.length,
      }
    })
  )

  return teachersWithReviews
}

export default async function TeachersPage() {
  const teachers = await getTeachers()

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground count={30} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <ScrollReveal>
          <FadeInUp delay={0.1}>
            <div className="mb-12 text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-2xl opacity-30 rounded-full" />
                <h1 className="relative text-5xl md:text-6xl font-bold mb-4">
                  <GradientText variant="primary" className="text-5xl md:text-6xl">
                    Our Teachers
                  </GradientText>
                </h1>
              </div>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                Meet our experienced Algebra 1 instructors ready to help you succeed
              </p>
            </div>
          </FadeInUp>
        </ScrollReveal>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {teachers.map((teacher: typeof teachers[0] & { reviews: any[], averageRating: number | null, reviewCount: number }, index: number) => (
            <StaggerItem key={teacher.id}>
              <GlowEffect intensity="medium">
                <GlassCard className="h-full backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background/90 to-background border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
                  <Card className="h-full border-0 bg-transparent shadow-none">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-full blur-lg animate-pulse" />
                          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-3xl font-bold text-primary shadow-lg shadow-primary/30 ring-4 ring-primary/20">
                            {teacher.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{teacher.name}</CardTitle>
                          {teacher.averageRating !== null && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]" />
                              <span className="text-sm font-bold text-yellow-400">{teacher.averageRating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">({teacher.reviewCount} review{teacher.reviewCount !== 1 ? 's' : ''})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <CardDescription className="mb-4 text-base leading-relaxed">{teacher.bio}</CardDescription>
                      <div className="space-y-3 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg bg-primary/5 border border-primary/10">
                          <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        {teacher.officeHours && (
                          <div className="flex items-start gap-2 text-muted-foreground p-2 rounded-lg bg-primary/5 border border-primary/10">
                            <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{teacher.officeHours}</span>
                          </div>
                        )}
                      </div>

                      {/* Reviews Section */}
                      {teacher.reviews.length > 0 && (
                        <div className="mt-auto pt-4 border-t border-primary/20">
                          <h4 className="text-sm font-semibold mb-3 text-primary">Recent Reviews</h4>
                          <div className="space-y-3">
                            {teacher.reviews.map((review: typeof teacher.reviews[0], reviewIndex: number) => (
                              <div 
                                key={review.id} 
                                className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-background border border-primary/10 hover:border-primary/20 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-3.5 w-3.5 transition-all ${
                                          star <= review.rating
                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]'
                                            : 'text-muted-foreground/30'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {review.userName || 'Anonymous'}
                                  </span>
                                </div>
                                {review.comment && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {review.comment}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </GlassCard>
              </GlowEffect>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </div>
  )
}
