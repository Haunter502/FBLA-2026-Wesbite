import { db } from '@/lib/db'
import { badges, userBadges, progress, units, lessons, quizzes, tests } from '@/lib/schema'
import { eq, and, desc } from '@/lib/drizzle-helpers'

interface BadgeCriteria {
  slug: string
  check: (userId: string, userProgress: any) => Promise<boolean>
}

const badgeCriteria: BadgeCriteria[] = [
  {
    slug: 'first-quiz',
    check: async (userId: string) => {
      const quizProgress = await db
        .select()
        .from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.status, 'COMPLETED')))
        .limit(1)
      return quizProgress.length > 0
    },
  },
  {
    slug: 'unit-complete',
    check: async (userId: string) => {
      // Get unit progress using the recommendations helper
      const { getUserProgressByUnit } = await import('@/lib/recommendations')
      const unitProgress = await getUserProgressByUnit(userId)
      // Check if any unit is 100% complete
      const completedUnits = unitProgress.filter((up) => up.percentage === 100)
      return completedUnits.length > 0
    },
  },
  {
    slug: 'perfect-score',
    check: async (userId: string) => {
      // Check if user has any quiz/test with 100% score
      const perfectScores = await db
        .select()
        .from(progress)
        .where(
          and(
            eq(progress.userId, userId),
            eq(progress.status, 'COMPLETED'),
            eq(progress.score, 100)
          )
        )
        .limit(1)
      return perfectScores.length > 0
    },
  },
  {
    slug: 'week-streak',
    check: async (userId: string) => {
      // This would check streak data - simplified for now
      // In a real implementation, you'd check the streaks table
      return false
    },
  },
  {
    slug: 'early-bird',
    check: async (userId: string) => {
      // Check if user completed something early in the day
      // Simplified for now
      return false
    },
  },
]

export async function checkAndAwardBadges(userId: string) {
  try {
    // Get all available badges
    const allBadges = await db.select().from(badges)
    const badgeMap = new Map(allBadges.map((b: typeof allBadges[0]) => [b.slug, b]))

    // Get user's existing badges
    const existingBadges = await db
      .select({ badgeId: userBadges.badgeId })
      .from(userBadges)
      .where(eq(userBadges.userId, userId))

    const existingBadgeIds = new Set(existingBadges.map((eb: typeof existingBadges[0]) => eb.badgeId))

    // Get user progress for badge checking
    const userProgress = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId))

    // Check each badge criteria
    for (const criteria of badgeCriteria) {
      const badge = badgeMap.get(criteria.slug) as typeof allBadges[0] | undefined
      if (!badge || !badge.id) continue

      // Skip if user already has this badge
      if (existingBadgeIds.has(badge.id)) continue

      // Check if criteria is met
      const shouldAward = await criteria.check(userId, userProgress)
      if (shouldAward) {
        // Award the badge
        await db.insert(userBadges).values({
          userId,
          badgeId: badge.id,
          reason: `Earned ${badge.name}`,
        })
      }
    }
  } catch (error) {
    console.error('Error checking and awarding badges:', error)
  }
}

