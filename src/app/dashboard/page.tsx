import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getNextBestLesson, getUserProgressByUnit } from "@/lib/recommendations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { BookOpen, Award, Flame, ArrowRight, TrendingUp, Trophy } from "lucide-react"
import Link from "next/link"
import { units, progress, userBadges, badges, streaks } from "@/lib/schema"
import { eq, and, desc, asc } from "@/lib/drizzle-helpers"
import { FadeInUp } from "@/components/animations/fade-in-up"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { AnimatedStatCard } from "@/components/dashboard/animated-stat-card"
import { AnimatedNumber } from "@/components/dashboard/animated-number"
import { AnimatedUnitCard } from "@/components/dashboard/animated-unit-card"
import { NotificationBell } from "@/components/dashboard/notification-bell"

function getLetterGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

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
    db.select().from(streaks).where(eq(streaks.userId, userId)).limit(1).then((rows: typeof streaks.$inferSelect[]) => rows[0]),
    getNextBestLesson(userId),
  ])

  // Calculate overall progress
  const totalLessons = unitProgress.reduce((sum, up) => sum + up.totalLessons, 0)
  const completedLessons = unitProgress.reduce((sum, up) => sum + up.completedLessons, 0)
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  // Calculate overall grade (average of all unit grades)
  const unitGrades = unitProgress
    .map(up => up.grade)
    .filter((grade): grade is number => grade !== null)
  const overallGrade = unitGrades.length > 0
    ? Math.round(unitGrades.reduce((sum, grade) => sum + grade, 0) / unitGrades.length)
    : null

  return {
    overallProgress,
    overallGrade,
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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {session.user.name || "Student"}!</h1>
          <p className="text-muted-foreground">Continue your Algebra 1 learning journey</p>
        </div>
        <div className="flex-shrink-0 flex items-center">
          <NotificationBell />
        </div>
      </div>

      {/* Stats Grid */}
      <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 items-stretch">
        <StaggerItem>
          <AnimatedStatCard>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="flex justify-center">
                  <ProgressRing progress={data.overallProgress} size={120} />
                </div>
              </CardContent>
            </Card>
          </AnimatedStatCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedStatCard>
            <Card className="h-full flex flex-col border-2 border-blue-500/50 bg-gradient-to-br from-blue-500/10 via-background to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-500" />
                  Overall Grade
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  {data.overallGrade !== null ? (
                    <>
                      <AnimatedNumber>
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-2">
                          {data.overallGrade}%
                        </div>
                      </AnimatedNumber>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30">
                        <span className="text-lg font-bold text-blue-600">
                          {getLetterGrade(data.overallGrade)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl text-muted-foreground">
                      No grades yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </AnimatedStatCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedStatCard>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <AnimatedNumber>
                    <div className="text-4xl font-bold text-orange-500 mb-2">
                      {data.streak?.current || 0}
                    </div>
                  </AnimatedNumber>
                  <p className="text-sm text-muted-foreground">
                    Longest: {data.streak?.longest || 0} days
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedStatCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedStatCard>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <AnimatedNumber>
                    <div className="text-4xl font-bold text-yellow-500 mb-2">
                      {data.badges.length}
                    </div>
                  </AnimatedNumber>
                  <p className="text-sm text-muted-foreground">Keep it up!</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedStatCard>
        </StaggerItem>
      </StaggerChildren>

      {/* Next Best Lesson */}
      {data.nextLesson && (
        <FadeInUp delay={0.3}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Next Best Lesson</CardTitle>
              <CardDescription>Continue your learning journey</CardDescription>
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
        </FadeInUp>
      )}

      {/* Unit Progress */}
      <FadeInUp delay={0.4}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.unitProgress.slice(0, 6).map((unitProgress, index) => (
              <StaggerItem key={unitProgress.unit.id}>
                <AnimatedUnitCard
                  href={`/units/${unitProgress.unit.slug}`}
                  title={unitProgress.unit.title}
                  percentage={unitProgress.percentage}
                  grade={unitProgress.grade}
                  letterGrade={unitProgress.grade !== null ? getLetterGrade(unitProgress.grade) : null}
                  index={index}
                />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
        <div className="mt-4 text-center">
          <Link href="/units">
            <Button variant="outline">View All Units</Button>
          </Link>
        </div>
      </FadeInUp>

      {/* Recent Badges */}
      {data.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {data.badges.map((userBadge: typeof data.badges[0]) => (
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
