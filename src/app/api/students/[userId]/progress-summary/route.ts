import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { progress, units, lessons, tutoringRequests, tutoringSlots, teachers } from '@/lib/schema'
import { eq, and, desc, asc, or, inArray, gte } from '@/lib/drizzle-helpers'
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

    type ProgressRow = (typeof allUserProgress)[number]
    if (allUserProgress.length > 0) {
      // Find progress with a unitId
      const unitProgressEntry = allUserProgress.find((p: ProgressRow) => p.unitId)
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
    const now = Math.floor(Date.now() / 1000) // Current time in Unix seconds
    const sessionsData = await db
      .select({
        id: tutoringRequests.id,
        topic: tutoringRequests.topic,
        status: tutoringRequests.status,
        scheduledSlotId: tutoringRequests.scheduledSlotId,
        matchedTeacherId: tutoringRequests.matchedTeacherId,
        matchedSlotId: tutoringRequests.matchedSlotId,
        matchStatus: tutoringRequests.matchStatus,
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
      .orderBy(desc(tutoringRequests.createdAt))
      .limit(20) // Get more to account for filtering

    // Get matched teachers and slots separately
    type SessionRow = (typeof sessionsData)[number]
    const matchedTeacherIds = [...new Set(sessionsData.map((s: SessionRow) => s.matchedTeacherId).filter(Boolean) as string[])]
    const matchedSlotIds = [...new Set(sessionsData.map((s: SessionRow) => s.matchedSlotId).filter(Boolean) as string[])]

    type TeacherRow = { id: string; name: string | null; email: string | null }
    type SlotRow = { id: string; start: number | Date; end: number | Date }
    const matchedTeachers: TeacherRow[] = matchedTeacherIds.length > 0
      ? await db
          .select({
            id: teachers.id,
            name: teachers.name,
            email: teachers.email,
          })
          .from(teachers)
          .where(inArray(teachers.id, matchedTeacherIds))
      : []

    const matchedSlots: SlotRow[] = matchedSlotIds.length > 0
      ? await db
          .select({
            id: tutoringSlots.id,
            start: tutoringSlots.start,
            end: tutoringSlots.end,
          })
          .from(tutoringSlots)
          .where(inArray(tutoringSlots.id, matchedSlotIds))
      : []

    type SessionWithExtras = SessionRow & { matchedTeacher: TeacherRow | null; matchedSlot: SlotRow | null; slot?: { start: number | Date; end: number | Date } }
    const upcomingSessions = sessionsData
      .map((session: SessionRow) => ({
        ...session,
        matchedTeacher: session.matchedTeacherId
          ? matchedTeachers.find((t: TeacherRow) => t.id === session.matchedTeacherId) || null
          : null,
        matchedSlot: session.matchedSlotId
          ? matchedSlots.find((s: SlotRow) => s.id === session.matchedSlotId) || null
          : null,
      }))
      .filter((session: SessionWithExtras) => {
        // Get the start time from either scheduledSlot or matchedSlot
        let startTime: number | null = null
        
        if (session.slot?.start) {
          startTime = typeof session.slot.start === 'number' 
            ? (session.slot.start < 10000000000 ? session.slot.start : Math.floor(session.slot.start / 1000))
            : Math.floor(new Date(session.slot.start).getTime() / 1000)
        } else if (session.matchedSlot?.start) {
          startTime = typeof session.matchedSlot.start === 'number' 
            ? (session.matchedSlot.start < 10000000000 ? session.matchedSlot.start : Math.floor(session.matchedSlot.start / 1000))
            : Math.floor(new Date(session.matchedSlot.start).getTime() / 1000)
        }
        
        // Only include sessions with a future start time
        // If no start time is available, include it (pending scheduling)
        return startTime === null || startTime >= now
      })
      .slice(0, 5) // Limit to 5 after filtering

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
      upcomingSessions: upcomingSessions.map((session: SessionWithExtras) => ({
        id: session.id,
        topic: session.topic,
        status: session.status,
        matchStatus: session.matchStatus,
        startTime: (session.slot?.start || session.matchedSlot?.start) 
          ? (typeof (session.slot?.start || session.matchedSlot?.start) === 'number' 
              ? (session.slot?.start || session.matchedSlot?.start) 
              : Math.floor(new Date(session.slot?.start || session.matchedSlot?.start).getTime() / 1000)) 
          : null,
        endTime: (session.slot?.end || session.matchedSlot?.end)
          ? (typeof (session.slot?.end || session.matchedSlot?.end) === 'number'
              ? (session.slot?.end || session.matchedSlot?.end)
              : Math.floor(new Date(session.slot?.end || session.matchedSlot?.end).getTime() / 1000))
          : null,
        matchedTeacher: session.matchedTeacher ? {
          id: session.matchedTeacher.id,
          name: session.matchedTeacher.name,
          email: session.matchedTeacher.email,
        } : null,
      })),
    })
  } catch (error) {
    console.error('Error fetching progress summary:', error)
    // Return a basic structure so the UI doesn't break
    return NextResponse.json({
      overallProgress: 0,
      overallGrade: null,
      currentUnit: null,
      nextLesson: null,
      upcomingSessions: [],
    })
  }
}

