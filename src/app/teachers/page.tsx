import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { teachers, reviews, users } from "@/lib/schema"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { GradientText } from "@/components/animations/gradient-text"
import { ParticleBackground } from "@/components/animations/particle-background"
import { FadeInUp } from "@/components/animations/fade-in-up"
import { TeachersGridWithAvatars } from "@/components/teachers/teachers-grid-with-avatars"
import { asc, eq, desc, and } from "@/lib/drizzle-helpers"

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
  const [session, teachersData] = await Promise.all([auth(), getTeachers()])
  const canEditAvatars =
    session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN'

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

        <TeachersGridWithAvatars teachers={teachersData} canEditAvatars={canEditAvatars} />
      </div>
    </div>
  )
}
