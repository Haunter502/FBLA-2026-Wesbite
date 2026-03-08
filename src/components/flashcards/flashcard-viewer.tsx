"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw, ChevronLeft, ChevronRight, Check, X, RotateCw, RefreshCw } from "lucide-react"
import { flashcards as flashcardsTable } from "@/lib/schema"
type Flashcard = typeof flashcardsTable.$inferSelect

interface FlashcardViewerProps {
  flashcards: Flashcard[]
}

const AGAIN_REINSERT_OFFSET = 2

export function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
  const [queue, setQueue] = useState<number[]>([])
  const [queueIndex, setQueueIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [againCardIndices, setAgainCardIndices] = useState<number[]>([])

  const initialQueue = useMemo(() => flashcards.map((_, i) => i), [flashcards.length])
  const isQueueInitialized = queue.length > 0 || flashcards.length === 0

  useEffect(() => {
    if (queue.length === 0 && flashcards.length > 0) {
      setQueue(initialQueue)
      setQueueIndex(0)
      setIsFlipped(false)
    }
  }, [initialQueue, flashcards.length, queue.length])

  const currentCardIndex = queue[queueIndex]
  const currentCard = currentCardIndex !== undefined ? flashcards[currentCardIndex] : null
  const isSessionComplete = queueIndex >= queue.length && queue.length > 0
  const progress = queue.length > 0 ? ((queueIndex + 1) / queue.length) * 100 : 0

  const handleFlip = () => {
    setIsFlipped((prev) => !prev)
  }

  const advanceToNext = () => {
    setIsFlipped(false)
    setQueueIndex((i) => i + 1)
  }

  const handlePrevious = () => {
    if (queueIndex > 0) {
      setIsFlipped(false)
      setQueueIndex((i) => i - 1)
    }
  }

  const handleDifficulty = (level: "again" | "good" | "easy") => {
    if (currentCardIndex === undefined) return

    if (level === "again") {
      setAgainCardIndices((prev) =>
        prev.includes(currentCardIndex) ? prev : [...prev, currentCardIndex],
      )
      setQueue((q) => {
        const next = [...q]
        const insertAt = Math.min(queueIndex + AGAIN_REINSERT_OFFSET, next.length)
        next.splice(insertAt, 0, currentCardIndex)
        return next
      })
    } else if (level === "easy") {
      setQueue((q) => q.filter((_, i) => i <= queueIndex || q[i] !== currentCardIndex))
    }
    advanceToNext()
  }

  const handleRestart = () => {
    setQueue(initialQueue)
    setQueueIndex(0)
    setIsFlipped(false)
    setAgainCardIndices([])
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isSessionComplete) return
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight" && isFlipped) advanceToNext()
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        handleFlip()
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [queueIndex, isFlipped, isSessionComplete])

  const handleReviewAgainOnly = () => {
    if (againCardIndices.length === 0) return
    const unique = Array.from(new Set(againCardIndices))
    setQueue(unique)
    setQueueIndex(0)
    setIsFlipped(false)
    setAgainCardIndices([])
  }

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No flashcards found</p>
        </CardContent>
      </Card>
    )
  }

  if (isSessionComplete) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <p className="text-lg font-semibold">Session complete!</p>
          <p className="text-sm text-muted-foreground">
            You&apos;ve reached the end of this set. Do you want to study it again?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRestart}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Study full set again
            </Button>
            {againCardIndices.length > 0 && (
              <Button variant="outline" onClick={handleReviewAgainOnly}>
                <RotateCw className="h-4 w-4 mr-2" />
                Review &quot;Again&quot; cards
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentCard || !isQueueInitialized) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Card {queueIndex + 1} of {queue.length}
        </p>
      </div>

      <div>
        <motion.div
          key={`${queueIndex}-${isFlipped ? "back" : "front"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="min-h-[400px] hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleFlip}
          >
            <CardContent className="flex items-center justify-center min-h-[400px] p-8 relative">
              <div className="text-center w-full">
                <p className="text-sm text-muted-foreground mb-4">
                  {isFlipped ? "Back" : "Front"}
                </p>
                <p className="text-2xl font-semibold">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
                {!isFlipped && currentCard.hint && (
                  <p className="text-sm text-muted-foreground mt-4 italic">
                    Hint: {currentCard.hint}
                  </p>
                )}
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground pointer-events-none">
                Click to flip • Press Space or Enter
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-between items-center gap-4">
        <Button variant="outline" onClick={handlePrevious} disabled={queueIndex === 0}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button variant="outline" onClick={handleFlip}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Flip
        </Button>
        <Button
          variant="outline"
          onClick={advanceToNext}
          disabled={queueIndex >= queue.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-4 items-center"
        >
          <p className="text-sm text-muted-foreground w-full text-center sm:w-auto sm:text-left">
            Rate your recall:
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDifficulty("again")}
            className="text-red-600 border-red-600/50 hover:bg-red-600/10"
          >
            <X className="h-4 w-4 mr-2" />
            Again
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDifficulty("good")}
            className="text-yellow-600 border-yellow-600/50 hover:bg-yellow-600/10"
          >
            <Check className="h-4 w-4 mr-2" />
            Good
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDifficulty("easy")}
            className="text-green-600 border-green-600/50 hover:bg-green-600/10"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Easy
          </Button>
        </motion.div>
      )}
    </div>
  )
}
