import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tests, units, progress } from "@/lib/schema"
import { eq, and } from "@/lib/drizzle-helpers"
import { QuizViewer } from "@/components/quizzes/quiz-viewer"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

async function getTest(testId: string, userId?: string) {
  const [test] = await db
    .select({
      id: tests.id,
      unitId: tests.unitId,
      title: tests.title,
      description: tests.description,
      timeLimit: tests.timeLimit,
      questions: tests.questions,
      passingScore: tests.passingScore,
      unitTitle: units.title,
      unitSlug: units.slug,
    })
    .from(tests)
    .leftJoin(units, eq(tests.unitId, units.id))
    .where(eq(tests.id, testId))
    .limit(1)

  if (!test) return null

  // Parse questions JSON (Drizzle returns it as a string)
  let questions
  try {
    questions = typeof test.questions === 'string' 
      ? JSON.parse(test.questions) 
      : Array.isArray(test.questions)
      ? test.questions
      : JSON.parse(String(test.questions))
  } catch (e) {
    console.error('Error parsing test questions:', e)
    questions = []
  }

  // Check if test is completed
  let completionStatus = null
  if (userId) {
    const [testProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.testId, testId)
        )
      )
      .limit(1)
    
    if (testProgress) {
      completionStatus = {
        isCompleted: testProgress.status === 'COMPLETED',
        score: testProgress.score,
        passed: testProgress.status === 'COMPLETED' && (testProgress.score || 0) >= test.passingScore,
      }
    }
  }

  return {
    ...test,
    questions,
    completionStatus,
  }
}

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const session = await auth()
  const { testId } = await params

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/tests/" + testId)
  }

  const test = await getTest(testId, session.user.id)

  if (!test) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link 
          href={`/units/${test.unitSlug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {test.unitTitle}
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">{test.title}</h1>
          {test.completionStatus?.isCompleted && (
            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        {test.description && (
          <p className="text-lg text-muted-foreground">{test.description}</p>
        )}
        <div className="flex gap-4 mt-4 text-sm text-muted-foreground items-center flex-wrap">
          {test.timeLimit && (
            <span>Time Limit: {test.timeLimit} minutes</span>
          )}
          <span>Questions: {test.questions.length}</span>
          <span>Passing Score: {test.passingScore}%</span>
          {test.completionStatus?.score !== null && test.completionStatus?.score !== undefined && (
            <span className={`font-semibold ${
              test.completionStatus.passed ? 'text-green-600' : 'text-orange-600'
            }`}>
              Your Score: {test.completionStatus.score}%
              {test.completionStatus.passed ? ' ✓' : ' (Retake to pass)'}
            </span>
          )}
        </div>
      </div>

      <QuizViewer 
        quiz={test} 
        userId={session.user.id} 
        isTest={true}
        completionStatus={test.completionStatus}
      />
    </div>
  )
}

