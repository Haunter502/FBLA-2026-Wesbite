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
import { GlassCard } from "@/components/animations/glass-card"
import { GlowEffect } from "@/components/animations/glow-effect"
import { GradientText } from "@/components/animations/gradient-text"
import { ParticleBackground } from "@/components/animations/particle-background"

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
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground count={30} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <FadeInUp delay={0.1}>
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Welcome back, <GradientText variant="primary" className="text-4xl md:text-5xl">{session.user.name || "Student"}</GradientText>!
              </h1>
              <p className="text-muted-foreground text-lg">Continue your Algebra 1 learning journey</p>
            </div>
            <div className="flex-shrink-0 flex items-center">
              <NotificationBell />
            </div>
          </div>
        </FadeInUp>

      {/* Stats Grid */}
      <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 items-stretch">
        <StaggerItem className="h-full">
          <AnimatedStatCard delay={0.1}>
            <div className="min-h-[219px] flex flex-col p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Overall Progress</h3>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex justify-center">
                  <ProgressRing progress={data.overallProgress} size={120} />
                </div>
              </div>
            </div>
          </AnimatedStatCard>
        </StaggerItem>

        <StaggerItem className="h-full">
          <AnimatedStatCard delay={0.15}>
            <div className="min-h-[219px] flex flex-col p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Trophy className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg">Overall Grade</h3>
              </div>
              <div className="flex-1 flex items-center justify-center">
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
              </div>
            </div>
          </AnimatedStatCard>
        </StaggerItem>

        <StaggerItem className="h-full">
          <AnimatedStatCard delay={0.2}>
            <div className="min-h-[219px] flex flex-col p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg">Streak</h3>
              </div>
              <div className="flex-1 flex items-center justify-center">
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
              </div>
            </div>
          </AnimatedStatCard>
        </StaggerItem>

        <StaggerItem className="h-full">
          <AnimatedStatCard delay={0.25}>
            <div className="min-h-[219px] flex flex-col p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <h3 className="font-semibold text-lg">Badges Earned</h3>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <AnimatedNumber>
                    <div className="text-4xl font-bold text-yellow-500 mb-2">
                      {data.badges.length}
                    </div>
                  </AnimatedNumber>
                  <p className="text-sm text-muted-foreground">Keep it up!</p>
                </div>
              </div>
            </div>
          </AnimatedStatCard>
        </StaggerItem>
      </StaggerChildren>

      {/* Next Best Lesson */}
      {data.nextLesson && (
        <FadeInUp delay={0.3}>
          <GlowEffect intensity="medium" className="mb-8">
            <GlassCard hover className="backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Next Best Lesson
                </CardTitle>
                <CardDescription>Continue your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{data.nextLesson.lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {data.nextLesson.lesson.description}
                    </p>
                  </div>
                  <Link href={`/lessons/${data.nextLesson.lesson.slug}`}>
                    <Button className="group hover-lift">
                      Start Lesson
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        </FadeInUp>
      )}

      {/* Unit Progress */}
      <FadeInUp delay={0.4}>
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <GradientText variant="primary" className="text-3xl md:text-4xl">Your Progress</GradientText>
          </h2>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.unitProgress.slice(0, 6).map((unitProgress, index) => (
              <StaggerItem key={unitProgress.unit.id} className="h-full">
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
        <div className="mt-6 text-center">
          <Link href="/units">
            <Button variant="outline" className="group hover-lift border-primary/30 hover:border-primary/50">
              View All Units
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </FadeInUp>

      {/* Recent Badges */}
      {data.badges.length > 0 && (
        <FadeInUp delay={0.5}>
          <GlowEffect intensity="low" className="mb-8">
            <GlassCard hover className="backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Recent Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {data.badges.map((userBadge: typeof data.badges[0]) => (
                    <GlowEffect key={userBadge.id} intensity="low">
                      <div className="flex flex-col items-center p-4 border border-primary/20 rounded-lg bg-background/40 hover:bg-background/60 transition-colors">
                        <span className="text-4xl mb-2">{userBadge.badge.icon}</span>
                        <span className="text-sm font-semibold text-center">{userBadge.badge.name}</span>
                      </div>
                    </GlowEffect>
                  ))}
                </div>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        </FadeInUp>
      )}
      </div>
    </div>
  )
}
