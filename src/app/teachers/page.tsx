import { db } from "@/lib/db"
import { teachers, reviews, users } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Clock, Star } from "lucide-react"
import { asc, eq, desc, and, isNotNull } from "@/lib/drizzle-helpers"

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Our Teachers</h1>
        <p className="text-muted-foreground">
          Meet our experienced Algebra 1 instructors ready to help you succeed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher: typeof teachers[0] & { reviews: any[], averageRating: number | null, reviewCount: number }) => (
          <Card key={teacher.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                  {teacher.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <CardTitle>{teacher.name}</CardTitle>
                  {teacher.averageRating !== null && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{teacher.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({teacher.reviewCount} review{teacher.reviewCount !== 1 ? 's' : ''})</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="mb-4">{teacher.bio}</CardDescription>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{teacher.email}</span>
                </div>
                {teacher.officeHours && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 mt-0.5" />
                    <span>{teacher.officeHours}</span>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              {teacher.reviews.length > 0 && (
                <div className="mt-auto pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">Recent Reviews</h4>
                  <div className="space-y-3">
                    {teacher.reviews.map((review: typeof teacher.reviews[0]) => (
                      <div key={review.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {review.userName || 'Anonymous'}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
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
        ))}
      </div>
    </div>
  )
}
