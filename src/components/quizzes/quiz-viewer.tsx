"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Trophy, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  timeLimit?: number | null
  questions: Question[]
  passingScore: number
}

interface CompletionStatus {
  isCompleted: boolean
  score: number | null
  passed: boolean
}

interface QuizViewerProps {
  quiz: Quiz
  userId: string
  isTest?: boolean
  completionStatus?: CompletionStatus | null
}

export function QuizViewer({ quiz, userId, isTest = false, completionStatus }: QuizViewerProps) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  )
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<{
    score: number
    correct: number
    total: number
    passed: boolean
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreviousResults, setShowPreviousResults] = useState(
    completionStatus?.isCompleted && completionStatus.score !== null
  )
  const [isRetaking, setIsRetaking] = useState(false)

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmitted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isSubmitted])

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (isSubmitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
  }

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting) return

    setIsSubmitting(true)

    // Calculate score
    let correct = 0
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })

    const score = Math.round((correct / quiz.questions.length) * 100)
    const passed = score >= quiz.passingScore

    setResults({
      score,
      correct,
      total: quiz.questions.length,
      passed,
    })
    setIsSubmitted(true)

    // Submit to API
    try {
      const endpoint = isTest ? `/api/tests/${quiz.id}/submit` : `/api/quizzes/${quiz.id}/submit`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          score,
          passed,
        }),
      })

      if (response.ok) {
        // Refresh the page to show updated completion status
        setTimeout(() => {
          router.refresh()
        }, 2000)
      } else {
        console.error(`Failed to submit ${isTest ? 'test' : 'quiz'}`)
      }
    } catch (error) {
      console.error(`Error submitting ${isTest ? 'test' : 'quiz'}:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleRetake = () => {
    setShowPreviousResults(false)
    setIsRetaking(true)
    setCurrentQuestion(0)
    setAnswers({})
    setResults(null)
    setIsSubmitted(false)
    setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null)
  }

  // Show previous results if completed and not retaking
  if (showPreviousResults && !isRetaking && completionStatus?.score !== null && !results) {
    const previousScore = completionStatus.score
    const previousPassed = completionStatus.passed
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {previousPassed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-orange-500" />
            )}
          </div>
          <CardTitle className="text-center text-3xl">
            {previousPassed ? "You Completed This!" : "Previous Attempt"}
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {previousPassed
              ? `You passed with a score of ${previousScore}%`
              : `You scored ${previousScore}%. You need ${quiz.passingScore}% to pass.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{previousScore}%</div>
              <p className="text-muted-foreground">
                {previousPassed ? "Great job! You can retake to improve your score." : "Try again to pass!"}
              </p>
            </div>

            <div className="flex gap-4 justify-center mt-6">
              <Button onClick={handleRetake} size="lg">
                {previousPassed ? "Retake to Improve Score" : "Retake Quiz"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {results.passed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-orange-500" />
            )}
          </div>
          <CardTitle className="text-center text-3xl">
            {results.passed ? "Congratulations!" : "Keep Practicing!"}
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {results.passed
              ? `You passed with a score of ${results.score}%`
              : `You scored ${results.score}%. You need ${quiz.passingScore}% to pass.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{results.score}%</div>
              <p className="text-muted-foreground">
                {results.correct} out of {results.total} questions correct
              </p>
            </div>

            <div className="space-y-3 mt-6">
              {quiz.questions.map((question, idx) => {
                const userAnswer = answers[question.id]
                const isCorrect = userAnswer === question.correctAnswer
                return (
                  <Card key={question.id} className={isCorrect ? "border-green-500" : "border-red-500"}>
                    <CardHeader>
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1" />
                        )}
                        <CardTitle className="text-lg">
                          Question {idx + 1}: {question.question}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {question.options.map((option, optIdx) => {
                          const isSelected = userAnswer === optIdx
                          const isCorrectOption = optIdx === question.correctAnswer
                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-md border ${
                                isCorrectOption
                                  ? "bg-green-50 dark:bg-green-950 border-green-500"
                                  : isSelected
                                  ? "bg-red-50 dark:bg-red-950 border-red-500"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectOption && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                {isSelected && !isCorrectOption && (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span
                                  className={
                                    isCorrectOption
                                      ? "font-semibold text-green-700 dark:text-green-300"
                                      : isSelected
                                      ? "text-red-700 dark:text-red-300"
                                      : ""
                                  }
                                >
                                  {option}
                                </span>
                                {isCorrectOption && (
                                  <span className="ml-auto text-sm text-green-600 dark:text-green-400">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex gap-4 justify-center mt-6">
              <Button onClick={handleRetake} variant="outline" size="lg">
                Retake {isTest ? "Test" : "Quiz"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Question {currentQuestion + 1} of {quiz.questions.length}</CardTitle>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-6">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <label
                  key={idx}
                  htmlFor={`option-${question.id}-${idx}`}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    id={`option-${question.id}-${idx}`}
                    name={`question-${question.id}`}
                    value={idx}
                    checked={answers[question.id] === idx}
                    onChange={() => handleAnswerSelect(question.id, idx)}
                    className="h-4 w-4 text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className="flex-1 font-normal">{option}</span>
                </label>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion < quiz.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : isTest ? "Submit Test" : "Submit Quiz"}
            </Button>
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {Object.keys(answers).length} of {quiz.questions.length} questions answered
        </div>
      </CardContent>
    </Card>
  )
}

