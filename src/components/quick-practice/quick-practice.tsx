'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Difficulty = 'easy' | 'medium' | 'hard'

interface Problem {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const generateProblem = (difficulty: Difficulty): Problem => {
  const problems: Record<Difficulty, Problem[]> = {
    easy: [
      {
        question: 'What is 2x + 3 = 7?',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        correctAnswer: 0,
        explanation: 'Subtract 3 from both sides: 2x = 4, then divide by 2: x = 2',
      },
      {
        question: 'What is 5 - x = 2?',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        correctAnswer: 1,
        explanation: 'Subtract 5 from both sides: -x = -3, multiply by -1: x = 3',
      },
    ],
    medium: [
      {
        question: 'Solve: 3x - 5 = 2x + 7',
        options: ['x = 10', 'x = 12', 'x = 14', 'x = 16'],
        correctAnswer: 1,
        explanation: 'Subtract 2x from both sides: x - 5 = 7, add 5: x = 12',
      },
      {
        question: 'Solve: 2(x + 3) = 10',
        options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
        correctAnswer: 1,
        explanation: 'Divide by 2: x + 3 = 5, subtract 3: x = 2',
      },
    ],
    hard: [
      {
        question: 'Solve: 2x² - 8 = 0',
        options: ['x = ±2', 'x = ±4', 'x = ±6', 'x = ±8'],
        correctAnswer: 0,
        explanation: 'Add 8: 2x² = 8, divide by 2: x² = 4, take square root: x = ±2',
      },
      {
        question: 'Solve: 3x + 2y = 12, if y = 3',
        options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
        correctAnswer: 1,
        explanation: 'Substitute y = 3: 3x + 6 = 12, subtract 6: 3x = 6, divide by 3: x = 2',
      },
    ],
  }

  const problemSet = problems[difficulty]
  return problemSet[Math.floor(Math.random() * problemSet.length)]
}

export function QuickPractice() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [hasStarted, setHasStarted] = useState(false) // New state to track if practice has started

  useEffect(() => {
    if (isActive && timeLeft > 0 && hasStarted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && hasStarted) {
      handleTimeUp()
    }
  }, [isActive, timeLeft, hasStarted])

  useEffect(() => {
    // Only generate problem after practice has started
    if (hasStarted && currentProblem === null && isActive) {
      setCurrentProblem(generateProblem(difficulty))
    }
  }, [difficulty, currentProblem, hasStarted, isActive])

  const handleStart = () => {
    setHasStarted(true)
    setIsActive(true)
    setTimeLeft(60)
    setScore(0)
    setTotal(0)
    setSelectedAnswer(null)
    setShowResult(false)
    // Don't generate problem immediately - wait a moment for timer to start
    setTimeout(() => {
      setCurrentProblem(generateProblem(difficulty))
    }, 500)
  }

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !currentProblem) return

    setSelectedAnswer(answerIndex)
    setTotal((prev) => prev + 1)
    setShowResult(true)

    if (answerIndex === currentProblem.correctAnswer) {
      setScore((prev) => prev + 1)
    }

    setTimeout(() => {
      setCurrentProblem(generateProblem(difficulty))
      setSelectedAnswer(null)
      setShowResult(false)
    }, 2000)
  }

  const handleTimeUp = () => {
    setIsActive(false)
    setCurrentProblem(null)
    setHasStarted(false)
  }

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          Quick Practice
        </h1>
        <p className="text-muted-foreground">Timed practice problems to test your skills</p>
      </div>

      {!hasStarted ? (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <CardTitle>Select Difficulty</CardTitle>
            <CardDescription>Choose your challenge level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <Button
                  key={diff}
                  variant={difficulty === diff ? 'default' : 'outline'}
                  onClick={() => setDifficulty(diff)}
                  className="capitalize"
                >
                  {diff}
                </Button>
              ))}
            </div>
            <Button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-primary to-primary/80"
              size="lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Practice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Timer and Score */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Time Remaining</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{score}</div>
                  <p className="text-xs text-muted-foreground mt-1">Correct</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {total > 0 ? Math.round((score / total) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Problem - Only show after practice has started */}
          {hasStarted && currentProblem && (
            <motion.div
              key={currentProblem.question}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Question {total + 1}</CardTitle>
                  <Badge variant="outline" className="w-fit capitalize">
                    {difficulty}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg font-medium">{currentProblem.question}</p>
                  <div className="space-y-2">
                    {currentProblem.options.map((option, index) => {
                      const isSelected = selectedAnswer === index
                      const isCorrect = index === currentProblem.correctAnswer
                      const showFeedback = showResult && isSelected

                      return (
                        <Button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          disabled={selectedAnswer !== null}
                          variant={showFeedback ? (isCorrect ? 'default' : 'destructive') : 'outline'}
                          className="w-full justify-start h-auto py-3"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{option}</span>
                            {showFeedback && (
                              <>
                                {isCorrect ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <XCircle className="h-5 w-5" />
                                )}
                              </>
                            )}
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                  {showResult && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-md bg-muted"
                      >
                        <p className="text-sm">
                          <strong>Explanation:</strong> {currentProblem.explanation}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          {!isActive && timeLeft === 0 && hasStarted && (
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 via-background to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Practice Complete!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-500 mb-2">
                      {total > 0 ? Math.round((score / total) * 100) : 0}%
                    </div>
                    <p className="text-muted-foreground">
                      You got {score} out of {total} correct
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setHasStarted(false)
                      setCurrentProblem(null)
                      handleStart()
                    }}
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

