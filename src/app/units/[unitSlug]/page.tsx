import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { units, lessons, quizzes, tests, skills, progress } from "../../../../drizzle/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Play, FileText, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { eq, asc, and } from "@/lib/drizzle-helpers"

async function getUnit(slug: string, userId?: string) {
  const [unit] = await db.select().from(units).where(eq(units.slug, slug)).limit(1)

  if (!unit) return null

  const [unitLessons, unitQuizzes, unitTests, unitSkills] = await Promise.all([
    db.select().from(lessons).where(eq(lessons.unitId, unit.id)).orderBy(asc(lessons.order)),
    db.select().from(quizzes).where(eq(quizzes.unitId, unit.id)),
    db.select().from(tests).where(eq(tests.unitId, unit.id)),
    db.select().from(skills).where(eq(skills.unitId, unit.id)).orderBy(asc(skills.name)),
  ])

  // Fetch completion status for lessons, quizzes, and tests if user is logged in
  let lessonProgress: Record<string, boolean> = {}
  let quizProgress: Record<string, { isCompleted: boolean; score: number | null; passed: boolean }> = {}
  let testProgress: Record<string, { isCompleted: boolean; score: number | null; passed: boolean }> = {}

  if (userId) {
    // Get all progress entries for this unit
    const allProgress = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.unitId, unit.id)
        )
      )

    // Map lesson completions
    unitLessons.forEach((lesson) => {
      const lessonProg = allProgress.find(
        (p) => p.lessonId === lesson.id && p.status === "COMPLETED"
      )
      lessonProgress[lesson.id] = !!lessonProg
    })

    // Map quiz completions with scores
    unitQuizzes.forEach((quiz) => {
      const quizProg = allProgress.find(
        (p) => p.quizId === quiz.id
      )
      if (quizProg) {
        quizProgress[quiz.id] = {
          isCompleted: quizProg.status === "COMPLETED",
          score: quizProg.score,
          passed: quizProg.status === "COMPLETED" && (quizProg.score || 0) >= (quiz.passingScore || 0),
        }
      }
    })

    // Map test completions with scores
    unitTests.forEach((test) => {
      const testProg = allProgress.find(
        (p) => p.testId === test.id
      )
      if (testProg) {
        testProgress[test.id] = {
          isCompleted: testProg.status === "COMPLETED",
          score: testProg.score,
          passed: testProg.status === "COMPLETED" && (testProg.score || 0) >= (test.passingScore || 0),
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
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/units" className="hover:text-foreground">
            Units
          </Link>
          <span>/</span>
          <span>{unit.title}</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">{unit.title}</h1>
        <p className="text-lg text-muted-foreground">{unit.description}</p>
      </div>

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
                {unit.lessons.length} lessons covering key concepts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unit.lessons.map((lesson) => {
                  const isCompleted = unit.lessonProgress[lesson.id] || false
                  return (
                    <Link key={lesson.id} href={`/lessons/${lesson.slug}`}>
                      <div className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer ${
                        isCompleted ? 'border-green-500/50 bg-green-500/5' : ''
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                            isCompleted 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              lesson.order
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{lesson.title}</h3>
                              {isCompleted && (
                                <span className="text-xs text-green-600 font-medium">Completed</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {lesson.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {lesson.duration && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {lesson.duration} min
                            </div>
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
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
                <div className="space-y-3">
                  {unit.quizzes.map((quiz) => {
                    const quizProgress = unit.quizProgress[quiz.id]
                    const isCompleted = quizProgress?.isCompleted || false
                    const score = quizProgress?.score
                    const passed = quizProgress?.passed || false
                    
                    return (
                      <div
                        key={quiz.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          isCompleted ? 'border-green-500/50 bg-green-500/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{quiz.title}</h3>
                              {isCompleted && (
                                <span className="text-xs text-green-600 font-medium">Completed</span>
                              )}
                              {score !== null && score !== undefined && (
                                <span className={`text-sm font-semibold ${
                                  passed ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  Score: {score}%
                                </span>
                              )}
                            </div>
                            {quiz.description && (
                              <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                            )}
                          </div>
                        </div>
                        <Link href={`/quizzes/${quiz.id}`}>
                          <Button variant={isCompleted ? "outline" : "default"}>
                            {isCompleted ? "Retake Quiz" : "Start Quiz"}
                          </Button>
                        </Link>
                      </div>
                    )
                  })}
                  {unit.tests.map((test) => {
                    const testProgress = unit.testProgress[test.id]
                    const isCompleted = testProgress?.isCompleted || false
                    const score = testProgress?.score
                    const passed = testProgress?.passed || false
                    
                    return (
                      <div
                        key={test.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          isCompleted ? 'border-green-500/50 bg-green-500/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{test.title}</h3>
                              {isCompleted && (
                                <span className="text-xs text-green-600 font-medium">Completed</span>
                              )}
                              {score !== null && score !== undefined && (
                                <span className={`text-sm font-semibold ${
                                  passed ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  Score: {score}%
                                </span>
                              )}
                            </div>
                            {test.description && (
                              <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                            )}
                          </div>
                        </div>
                        <Link href={`/tests/${test.id}`}>
                          <Button variant={isCompleted ? "outline" : "default"}>
                            {isCompleted ? "Retake Test" : "Start Test"}
                          </Button>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {unit.skills.map((skill) => (
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
