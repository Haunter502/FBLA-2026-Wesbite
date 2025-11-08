import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { quizzes, units, progress } from "../../../../drizzle/schema"
import { eq, and } from "@/lib/drizzle-helpers"
import { QuizViewer } from "@/components/quizzes/quiz-viewer"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

async function getQuiz(quizId: string, userId?: string) {
  const [quiz] = await db
    .select({
      id: quizzes.id,
      unitId: quizzes.unitId,
      title: quizzes.title,
      description: quizzes.description,
      timeLimit: quizzes.timeLimit,
      questions: quizzes.questions,
      passingScore: quizzes.passingScore,
      unitTitle: units.title,
      unitSlug: units.slug,
    })
    .from(quizzes)
    .leftJoin(units, eq(quizzes.unitId, units.id))
    .where(eq(quizzes.id, quizId))
    .limit(1)

  if (!quiz) return null

  // Parse questions JSON (Drizzle returns it as a string)
  let questions
  try {
    questions = typeof quiz.questions === 'string' 
      ? JSON.parse(quiz.questions) 
      : Array.isArray(quiz.questions)
      ? quiz.questions
      : JSON.parse(String(quiz.questions))
  } catch (e) {
    console.error('Error parsing quiz questions:', e)
    questions = []
  }

  // Check if quiz is completed
  let completionStatus = null
  if (userId) {
    const [quizProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.quizId, quizId)
        )
      )
      .limit(1)
    
    if (quizProgress) {
      completionStatus = {
        isCompleted: quizProgress.status === 'COMPLETED',
        score: quizProgress.score,
        passed: quizProgress.status === 'COMPLETED' && (quizProgress.score || 0) >= quiz.passingScore,
      }
    }
  }

  return {
    ...quiz,
    questions,
    completionStatus,
  }
}

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const session = await auth()
  const { quizId } = await params

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/quizzes/" + quizId)
  }

  const quiz = await getQuiz(quizId, session.user.id)

  if (!quiz) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link 
          href={`/units/${quiz.unitSlug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {quiz.unitTitle}
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">{quiz.title}</h1>
          {quiz.completionStatus?.isCompleted && (
            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        {quiz.description && (
          <p className="text-lg text-muted-foreground">{quiz.description}</p>
        )}
        <div className="flex gap-4 mt-4 text-sm text-muted-foreground items-center flex-wrap">
          {quiz.timeLimit && (
            <span>Time Limit: {quiz.timeLimit} minutes</span>
          )}
          <span>Questions: {quiz.questions.length}</span>
          <span>Passing Score: {quiz.passingScore}%</span>
          {quiz.completionStatus?.score !== null && quiz.completionStatus?.score !== undefined && (
            <span className={`font-semibold ${
              quiz.completionStatus.passed ? 'text-green-600' : 'text-orange-600'
            }`}>
              Your Score: {quiz.completionStatus.score}%
              {quiz.completionStatus.passed ? ' ✓' : ' (Retake to pass)'}
            </span>
          )}
        </div>
      </div>

      <QuizViewer 
        quiz={quiz} 
        userId={session.user.id} 
        completionStatus={quiz.completionStatus}
      />
    </div>
  )
}

