import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { progress, units, lessons, tutoringRequests, tutoringSlots } from '@/lib/schema'
import { eq, and, desc, asc, or } from '@/lib/drizzle-helpers'
import { getNextBestLesson, getUserProgressByUnit } from '@/lib/recommendations'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Only allow users to view their own progress or admins/teachers
    if (session.user.id !== userId && session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get overall progress
    const unitProgress = await getUserProgressByUnit(userId)
    const totalLessons = unitProgress.reduce((sum, up) => sum + up.totalLessons, 0)
    const completedLessons = unitProgress.reduce((sum, up) => sum + up.completedLessons, 0)
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    // Calculate overall grade (average of all unit grades)
    const unitGrades = unitProgress
      .map(up => up.grade)
      .filter((grade): grade is number => grade !== null)
    const overallGrade = unitGrades.length > 0
      ? Math.round(unitGrades.reduce((sum, grade) => sum + grade, 0) / unitGrades.length)
      : null

    // Get current unit progress (most recently accessed or in progress)
    const allUserProgress = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId))
      .orderBy(desc(progress.lastViewedAt))
      .limit(50)

    // Find the most recently accessed unit
    let currentUnit = null
    let currentUnitProgress = null

    if (allUserProgress.length > 0) {
      // Find progress with a unitId
      const unitProgressEntry = allUserProgress.find(p => p.unitId)
      if (unitProgressEntry?.unitId) {
        const [unit] = await db
          .select()
          .from(units)
          .where(eq(units.id, unitProgressEntry.unitId))
          .limit(1)

        if (unit) {
          currentUnit = unit
          currentUnitProgress = unitProgress.find(up => up.unit.id === unit.id)
        }
      }
    }

    // If no current unit, get the first unit
    if (!currentUnit) {
      const [firstUnit] = await db
        .select()
        .from(units)
        .orderBy(asc(units.order))
        .limit(1)

      if (firstUnit) {
        currentUnit = firstUnit
        currentUnitProgress = unitProgress.find(up => up.unit.id === firstUnit.id)
      }
    }

    // Get next lesson
    const nextLessonData = await getNextBestLesson(userId)

    // Get upcoming tutoring sessions
    const upcomingSessions = await db
      .select({
        id: tutoringRequests.id,
        topic: tutoringRequests.topic,
        status: tutoringRequests.status,
        scheduledSlotId: tutoringRequests.scheduledSlotId,
        slot: {
          start: tutoringSlots.start,
          end: tutoringSlots.end,
        },
      })
      .from(tutoringRequests)
      .leftJoin(tutoringSlots, eq(tutoringRequests.scheduledSlotId, tutoringSlots.id))
      .where(
        and(
          eq(tutoringRequests.userId, userId),
          or(
            eq(tutoringRequests.status, 'PENDING'),
            eq(tutoringRequests.status, 'MATCHED')
          )
        )
      )
      .orderBy(asc(tutoringSlots.start))
      .limit(5)

    return NextResponse.json({
      overallProgress,
      overallGrade,
      currentUnit: currentUnit ? {
        id: currentUnit.id,
        title: currentUnit.title,
        slug: currentUnit.slug,
        progress: currentUnitProgress || {
          totalLessons: 0,
          completedLessons: 0,
          percentage: 0,
          grade: null,
        },
      } : null,
      nextLesson: nextLessonData ? {
        id: nextLessonData.lesson.id,
        title: nextLessonData.lesson.title,
        slug: nextLessonData.lesson.slug,
        unitTitle: nextLessonData.unit.title,
        unitSlug: nextLessonData.unit.slug,
      } : null,
      upcomingSessions: upcomingSessions.map(session => ({
        id: session.id,
        topic: session.topic,
        status: session.status,
        startTime: session.slot?.start ? (typeof session.slot.start === 'number' ? session.slot.start : Math.floor(new Date(session.slot.start).getTime() / 1000)) : null,
        endTime: session.slot?.end ? (typeof session.slot.end === 'number' ? session.slot.end : Math.floor(new Date(session.slot.end).getTime() / 1000)) : null,
      })),
    })
  } catch (error) {
    console.error('Error fetching progress summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress summary' },
      { status: 500 }
    )
  }
}

