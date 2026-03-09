import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { progress, units, lessons, quizzes, tests } from '@/lib/schema'
import { eq, and, desc } from '@/lib/drizzle-helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { FadeInUp } from '@/components/animations/fade-in-up'
import { GlowEffect } from '@/components/animations/glow-effect'
import { GradientText } from '@/components/animations/gradient-text'
import { ParticleBackground } from '@/components/animations/particle-background'
import { AnimatedStat } from '@/components/animations/animated-stats'
import { ProgressChart } from '@/components/progress-analytics/progress-chart'
import { BarChart3, TrendingUp, BookOpen, Award, Calendar, Target, Zap, Clock, TrendingDown } from 'lucide-react'
import { AnimatedAnalyticsHeader } from '@/components/analytics/animated-header'
import { DailyActivityChart } from '@/components/analytics/daily-activity-chart'
import { UnitPerformanceList } from '@/components/analytics/unit-performance-list'

async function getAnalyticsData(userId: string) {
  // Get all progress
  const allProgress = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, userId))

  // Get daily activity for last 7 days (for chart)
  const dailyActivity: { day: string; count: number }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayStart = Math.floor(new Date(date.setHours(0, 0, 0, 0)).getTime() / 1000)
    const dayEnd = Math.floor(new Date(date.setHours(23, 59, 59, 999)).getTime() / 1000)
    
    const dayProgress = allProgress.filter((p: typeof allProgress[0]) => {
      const createdAt = typeof p.createdAt === 'number' ? p.createdAt : new Date(p.createdAt).getTime() / 1000
      return createdAt >= dayStart && createdAt <= dayEnd
    })
    
    dailyActivity.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: dayProgress.length,
    })
  }

  // Get weekly activity (last 7 days)
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60
  const weeklyProgress = allProgress.filter(
    (p: typeof allProgress[0]) =>
      p.createdAt && (typeof p.createdAt === 'number' ? p.createdAt : new Date(p.createdAt).getTime() / 1000) >= sevenDaysAgo
  )

  // Get monthly activity (last 30 days)
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
  const monthlyProgress = allProgress.filter(
    (p: typeof allProgress[0]) =>
      p.createdAt && (typeof p.createdAt === 'number' ? p.createdAt : new Date(p.createdAt).getTime() / 1000) >= thirtyDaysAgo
  )

  // Get unit progress with detailed analytics
  const allUnits = await db.select().from(units).orderBy(units.order)
  const unitProgress = allUnits.map((unit: typeof allUnits[0]) => {
    const unitProg = allProgress.filter(
      (p: typeof allProgress[0]) => p.unitId === unit.id
    )
    const completed = unitProg.filter((p: typeof allProgress[0]) => p.status === 'COMPLETED')
    
    // Get scores for this unit
    const scores = unitProg
      .filter((p: typeof allProgress[0]) => p.score !== null)
      .map((p: typeof allProgress[0]) => p.score as number)
    
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length)
      : null

    return {
      id: unit.id,
      title: unit.title,
      completed: completed.length,
      total: unitProg.length,
      averageScore,
      completionRate: unitProg.length > 0 ? Math.round((completed.length / unitProg.length) * 100) : 0,
    }
  })

  // Calculate overall stats
  const completedLessons = allProgress.filter(
    (p: typeof allProgress[0]) => p.lessonId && p.status === 'COMPLETED'
  ).length
  const completedQuizzes = allProgress.filter(
    (p: typeof allProgress[0]) => p.quizId && p.status === 'COMPLETED'
  ).length
  const completedTests = allProgress.filter(
    (p: typeof allProgress[0]) => p.testId && p.status === 'COMPLETED'
  ).length

  const allScores = allProgress
    .filter((p: typeof allProgress[0]) => p.score !== null)
    .map((p: typeof allProgress[0]) => p.score as number)
  
  const averageScore = allScores.length > 0
    ? Math.round(allScores.reduce((sum: number, s: number) => sum + s, 0) / allScores.length)
    : 0

  const bestScore = allScores.length > 0 ? Math.max(...allScores) : null
  const worstScore = allScores.length > 0 ? Math.min(...allScores) : null

  // Calculate improvement trend (compare last 7 days vs previous 7 days)
  const fourteenDaysAgo = Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60
  const previousWeekProgress = allProgress.filter(
    (p: typeof allProgress[0]) => {
      const createdAt = typeof p.createdAt === 'number' ? p.createdAt : new Date(p.createdAt).getTime() / 1000
      return createdAt >= fourteenDaysAgo && createdAt < sevenDaysAgo
    }
  )
  const improvement = weeklyProgress.length - previousWeekProgress.length

  // Find best and worst performing units
  const unitsWithScores = unitProgress.filter((u: typeof unitProgress[0]) => u.averageScore !== null)
  const bestUnit = unitsWithScores.length > 0
    ? unitsWithScores.reduce((best: typeof unitProgress[0], current: typeof unitProgress[0]) => 
        (current.averageScore || 0) > (best.averageScore || 0) ? current : best
      )
    : null
  const worstUnit = unitsWithScores.length > 0
    ? unitsWithScores.reduce((worst: typeof unitProgress[0], current: typeof unitProgress[0]) => 
        (current.averageScore || 0) < (worst.averageScore || 0) ? current : worst
      )
    : null

  return {
    dailyActivity,
    weeklyActivity: weeklyProgress.length,
    monthlyActivity: monthlyProgress.length,
    improvement,
    unitProgress,
    overallStats: {
      lessons: completedLessons,
      quizzes: completedQuizzes,
      tests: completedTests,
      averageScore,
      bestScore,
      worstScore,
    },
    bestUnit,
    worstUnit,
  }
}

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/sign-in')
  }

  const data = await getAnalyticsData(session.user.id)

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Theme-aware gradient and blur (uses selected primary/secondary) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      <ParticleBackground count={20} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <FadeInUp delay={0.1}>
          <AnimatedAnalyticsHeader />
        </FadeInUp>

      {/* Key Metrics - Different from dashboard */}
      <FadeInUp delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlowEffect intensity="medium">
            <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedStat value={data.weeklyActivity} label="Items" duration={1.5} />
                <div className="flex items-center gap-1 mt-2">
                  {data.improvement > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">+{data.improvement} vs last week</span>
                    </>
                  ) : data.improvement < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-500">{data.improvement} vs last week</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Same as last week</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </GlowEffect>

          <GlowEffect intensity="medium">
            <Card className="bg-gradient-to-br from-secondary/10 via-background to-background border-secondary/30 hover:border-secondary/50 transition-all hover:shadow-lg hover:shadow-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-secondary" />
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedStat value={data.overallStats.averageScore} suffix="%" label="Average" duration={1.5} />
                {data.overallStats.bestScore && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Best: {data.overallStats.bestScore}% | Worst: {data.overallStats.worstScore || 'N/A'}%
                  </p>
                )}
              </CardContent>
            </Card>
          </GlowEffect>

          <GlowEffect intensity="medium">
            <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Monthly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedStat value={data.monthlyActivity} label="Items" duration={1.5} />
                <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
              </CardContent>
            </Card>
          </GlowEffect>

          <GlowEffect intensity="medium">
            <Card className="bg-gradient-to-br from-green-500/10 via-background to-background border-green-500/30 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-500" />
                  Total Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedStat 
                  value={data.overallStats.lessons + data.overallStats.quizzes + data.overallStats.tests} 
                  label="Items" 
                  duration={1.5} 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {data.overallStats.lessons}L + {data.overallStats.quizzes}Q + {data.overallStats.tests}T
                </p>
              </CardContent>
            </Card>
          </GlowEffect>
        </div>
      </FadeInUp>

      {/* Daily Activity Chart - Unique to Analytics */}
      <FadeInUp delay={0.3}>
        <DailyActivityChart 
          dailyActivity={data.dailyActivity}
          weeklyActivity={data.weeklyActivity}
          improvement={data.improvement}
        />
      </FadeInUp>

      {/* Unit Performance Analysis - Enhanced with scores */}
      <FadeInUp delay={0.4}>
        <UnitPerformanceList unitProgress={data.unitProgress} />
      </FadeInUp>

      {/* Best & Worst Performing Units - Unique Analytics Feature */}
      {(data.bestUnit || data.worstUnit) && (
        <FadeInUp delay={0.5}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {data.bestUnit && (
              <GlowEffect intensity="medium">
                <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 via-background to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="h-5 w-5" />
                      Best Performing Unit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{data.bestUnit.title}</h3>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-3xl font-bold text-green-600">
                            {data.bestUnit.averageScore}%
                          </div>
                          <p className="text-sm text-muted-foreground">Average Score</p>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-primary">
                            {data.bestUnit.completionRate}%
                          </div>
                          <p className="text-sm text-muted-foreground">Completion</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </GlowEffect>
            )}

            {data.worstUnit && data.worstUnit.id !== data.bestUnit?.id && (
              <GlowEffect intensity="medium">
                <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-background to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Target className="h-5 w-5" />
                      Needs Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{data.worstUnit.title}</h3>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-3xl font-bold text-orange-600">
                            {data.worstUnit.averageScore}%
                          </div>
                          <p className="text-sm text-muted-foreground">Average Score</p>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-primary">
                            {data.worstUnit.completionRate}%
                          </div>
                          <p className="text-sm text-muted-foreground">Completion</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </GlowEffect>
            )}
          </div>
        </FadeInUp>
      )}
      </div>
    </div>
  )
}

