import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getNextBestLesson, getUserProgressByUnit } from "@/lib/recommendations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { BookOpen, Award, Flame, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { units, progress, userBadges, badges, streaks } from "../../../drizzle/schema"
import { eq, and, desc, asc } from "@/lib/drizzle-helpers"

async function getDashboardData(userId: string) {
  const [unitProgress, userBadgesList, userStreak, nextLesson] = await Promise.all([
    getUserProgressByUnit(userId),
    db
      .select({
        id: userBadges.id,
        awardedAt: userBadges.awardedAt,
        reason: userBadges.reason,
        badge: {
          id: badges.id,
          name: badges.name,
          description: badges.description,
          icon: badges.icon,
        },
      })
      .from(userBadges)
      .leftJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.awardedAt))
      .limit(5),
    db.select().from(streaks).where(eq(streaks.userId, userId)).limit(1).then(rows => rows[0]),
    getNextBestLesson(userId),
  ])

  // Calculate overall progress
  const totalLessons = unitProgress.reduce((sum, up) => sum + up.totalLessons, 0)
  const completedLessons = unitProgress.reduce((sum, up) => sum + up.completedLessons, 0)
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return {
    overallProgress,
    unitProgress,
    badges: userBadgesList,
    streak: userStreak,
    nextLesson,
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/auth/sign-in")
  }

  const data = await getDashboardData(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {session.user.name || "Student"}!</h1>
        <p className="text-muted-foreground">Continue your Algebra 1 learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ProgressRing progress={data.overallProgress} size={120} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {data.streak?.current || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Longest: {data.streak?.longest || 0} days
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">
                {data.badges.length}
              </div>
              <p className="text-sm text-muted-foreground">Keep it up!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Best Lesson */}
      {data.nextLesson && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Next Best Lesson</CardTitle>
            <CardDescription>{data.nextLesson.reason}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{data.nextLesson.lesson.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {data.nextLesson.lesson.description}
                </p>
              </div>
              <Link href={`/lessons/${data.nextLesson.lesson.slug}`}>
                <Button>
                  Start Lesson
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unit Progress */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.unitProgress.slice(0, 6).map((unitProgress) => (
            <Link key={unitProgress.unit.id} href={`/units/${unitProgress.unit.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{unitProgress.unit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{unitProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${unitProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/units">
            <Button variant="outline">View All Units</Button>
          </Link>
        </div>
      </div>

      {/* Recent Badges */}
      {data.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {data.badges.map((userBadge) => (
                <div
                  key={userBadge.id}
                  className="flex flex-col items-center p-4 border rounded-lg"
                >
                  <span className="text-4xl mb-2">{userBadge.badge.icon}</span>
                  <span className="text-sm font-semibold">{userBadge.badge.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
