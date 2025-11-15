import { notFound } from "next/navigation"
import { unstable_noStore } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { units, lessons, quizzes, tests, skills, progress } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { eq, asc } from "@/lib/drizzle-helpers"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { AnimatedUnitHeader } from "@/components/units/animated-unit-header"
import { AnimatedLessonItem } from "@/components/units/animated-lesson-item"
import { AnimatedQuizTestItem } from "@/components/units/animated-quiz-test-item"

// Type aliases for better type inference
type Lesson = typeof lessons.$inferSelect
type Quiz = typeof quizzes.$inferSelect
type Test = typeof tests.$inferSelect
type Skill = typeof skills.$inferSelect
type Progress = typeof progress.$inferSelect

// Disable caching to ensure fresh progress data
export const revalidate = 0

async function getUnit(slug: string, userId?: string) {
  // Force no caching
  unstable_noStore()
  
  const [unit] = await db.select().from(units).where(eq(units.slug, slug)).limit(1)

  if (!unit) return null

  const [unitLessons, allUnitQuizzes, unitTests, unitSkills] = await Promise.all([
    db.select().from(lessons).where(eq(lessons.unitId, unit.id)).orderBy(asc(lessons.order)),
    db.select().from(quizzes).where(eq(quizzes.unitId, unit.id)),
    db.select().from(tests).where(eq(tests.unitId, unit.id)),
    db.select().from(skills).where(eq(skills.unitId, unit.id)).orderBy(asc(skills.name)),
  ])

  // Filter out practice problem quizzes from assessments (they're accessed via lessons)
  const unitQuizzes = allUnitQuizzes.filter((q: Quiz) => !q.title.includes('Practice Problems'))

  // Fetch completion status for lessons, quizzes, and tests if user is logged in
  let lessonProgress: Record<string, boolean> = {}
  let quizProgress: Record<string, { isCompleted: boolean; score: number | null; passed: boolean }> = {}
  let testProgress: Record<string, { isCompleted: boolean; score: number | null; passed: boolean }> = {}

  if (userId) {
    // Get all progress entries for this user
    // We'll filter by unitId and quiz/test IDs in memory
    const allUserProgress = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId))
    
    // Get IDs of quizzes and tests in this unit
    const unitQuizIds = new Set(unitQuizzes.map((q: Quiz) => q.id))
    const unitTestIds = new Set(unitTests.map((t: Test) => t.id))
    const unitLessonIds = new Set(unitLessons.map((l: Lesson) => l.id))
    
    // Filter to only include progress for this unit's content
    const filteredProgress = allUserProgress.filter((p: Progress) => 
      p.unitId === unit.id || 
      (p.quizId && unitQuizIds.has(p.quizId)) ||
      (p.testId && unitTestIds.has(p.testId)) ||
      (p.lessonId && unitLessonIds.has(p.lessonId))
    )

    // Map lesson completions
    unitLessons.forEach((lesson: Lesson) => {
      const lessonProg = filteredProgress.find(
        (p: Progress) => p.lessonId === lesson.id && p.status === "COMPLETED"
      )
      lessonProgress[lesson.id] = !!lessonProg
    })

    // Map quiz completions with scores - show any attempt with a score
    unitQuizzes.forEach((quiz: Quiz) => {
      const quizProg = filteredProgress.find(
        (p: Progress) => p.quizId === quiz.id
      )
      if (quizProg) {
        const score = quizProg.score
        const isCompleted = quizProg.status === "COMPLETED"
        const passed = isCompleted && (score !== null && score !== undefined) && score >= (quiz.passingScore || 70)
        
        quizProgress[quiz.id] = {
          isCompleted,
          score: score ?? null,
          passed,
        }
      }
    })

    // Map test completions with scores - show any attempt with a score
    unitTests.forEach((test: Test) => {
      const testProg = filteredProgress.find(
        (p: Progress) => p.testId === test.id
      )
      if (testProg) {
        const score = testProg.score
        const isCompleted = testProg.status === "COMPLETED"
        const passed = isCompleted && (score !== null && score !== undefined) && score >= (test.passingScore || 70)
        
        testProgress[test.id] = {
          isCompleted,
          score: score ?? null,
          passed,
        }
      }
    })
  }

  return {
    ...unit,
    lessons: unitLessons,
    quizzes: unitQuizzes,
    tests: unitTests,
    skills: unitSkills,
    lessonProgress,
    quizProgress,
    testProgress,
  }
}

export default async function UnitPage({ params }: { params: Promise<{ unitSlug: string }> }) {
  const { unitSlug } = await params
  const session = await auth()
  const unit = await getUnit(unitSlug, session?.user?.id)

  if (!unit) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/units" className="hover:text-foreground transition-colors">
              Units
            </Link>
            <span>/</span>
            <span>{unit.title}</span>
          </div>
          <AnimatedUnitHeader title={unit.title} description={unit.description} />
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lessons
              </CardTitle>
              <CardDescription>
                8 lessons covering key concepts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaggerChildren className="space-y-3">
                {unit.lessons.map((lesson: Lesson, index: number) => {
                  const isCompleted = unit.lessonProgress[lesson.id] || false
                  return (
                    <StaggerItem key={lesson.id}>
                      <AnimatedLessonItem
                        href={`/lessons/${lesson.slug}`}
                        lesson={{
                          order: lesson.order,
                          title: lesson.title,
                          description: lesson.description,
                          duration: lesson.duration,
                          type: lesson.type,
                        }}
                        isCompleted={isCompleted}
                        delay={index * 0.1}
                      />
                    </StaggerItem>
                  )
                })}
              </StaggerChildren>
            </CardContent>
          </Card>

          {/* Quizzes & Tests */}
          {(unit.quizzes.length > 0 || unit.tests.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>Test your knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                <StaggerChildren className="space-y-3">
                  {unit.quizzes.map((quiz: Quiz, index: number) => {
                    const quizProgress = unit.quizProgress[quiz.id]
                    const isCompleted = quizProgress?.isCompleted || false
                    const score = quizProgress?.score
                    const passed = quizProgress?.passed || false
                    
                    return (
                      <StaggerItem key={quiz.id}>
                        <AnimatedQuizTestItem
                          id={quiz.id}
                          title={quiz.title}
                          description={quiz.description}
                          href={`/quizzes/${quiz.id}`}
                          isCompleted={isCompleted}
                          score={score}
                          passed={passed}
                          delay={index * 0.1}
                        />
                      </StaggerItem>
                    )
                  })}
                  {unit.tests.map((test: Test, index: number) => {
                    const testProgress = unit.testProgress[test.id]
                    const isCompleted = testProgress?.isCompleted || false
                    const score = testProgress?.score
                    const passed = testProgress?.passed || false
                    
                    return (
                      <StaggerItem key={test.id}>
                        <AnimatedQuizTestItem
                          id={test.id}
                          title={test.title}
                          description={test.description}
                          href={`/tests/${test.id}`}
                          isCompleted={isCompleted}
                          score={score}
                          passed={passed}
                          delay={(unit.quizzes.length + index) * 0.1}
                        />
                      </StaggerItem>
                    )
                  })}
                </StaggerChildren>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Bar */}
          {session?.user?.id && unit.lessons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Lessons Completed</span>
                    <span className="font-semibold">
                      {Object.values(unit.lessonProgress).filter(Boolean).length} / {unit.lessons.length}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(Object.values(unit.lessonProgress).filter(Boolean).length / unit.lessons.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {unit.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unit.skills.map((skill: Skill) => (
                    <div
                      key={skill.id}
                      className="px-3 py-2 bg-muted rounded-md text-sm"
                    >
                      {skill.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Learning Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Master key concepts in {unit.title}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Apply knowledge through practice problems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Demonstrate understanding through assessments</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
