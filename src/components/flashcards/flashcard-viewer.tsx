"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw, ChevronLeft, ChevronRight, Check, X, RotateCw } from "lucide-react"
type Flashcard = {
  id: string
  front: string
  back: string
  hint?: string | null
  order: number
  setId: string
}

interface FlashcardViewerProps {
  flashcards: Flashcard[]
}

export function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [difficulty, setDifficulty] = useState<"again" | "good" | "easy" | null>(null)

  const currentCard = flashcards[currentIndex]
  const progress = ((currentIndex + 1) / flashcards.length) * 100

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setDifficulty(null)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setDifficulty(null)
    }
  }

  const handleDifficulty = (level: "again" | "good" | "easy") => {
    setDifficulty(level)
    // In a real implementation, this would save to the database
    // For now, just mark it and move to next card after a delay
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        handleNext()
      }
    }, 500)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        handleFlip()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentIndex, isFlipped])

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No flashcards found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card Counter */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
      </div>

      {/* Flashcard */}
      <div className="relative">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="min-h-[400px] cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleFlip}
          >
            <CardContent className="flex items-center justify-center min-h-[400px] p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isFlipped ? "back" : "front"}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  {!isFlipped ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">Front</p>
                      <p className="text-2xl font-semibold">{currentCard.front}</p>
                      {currentCard.hint && (
                        <p className="text-sm text-muted-foreground mt-4 italic">
                          Hint: {currentCard.hint}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">Back</p>
                      <p className="text-2xl">{currentCard.back}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <p className="absolute bottom-4 text-xs text-muted-foreground">
                Click to flip • Press Space or Enter
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={handleFlip}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Flip
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Difficulty Rating (shown when flipped) */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4"
        >
          <p className="text-sm text-muted-foreground self-center">Rate your recall:</p>
          <Button
            variant={difficulty === "again" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDifficulty("again")}
            className="text-red-600"
          >
            <X className="h-4 w-4 mr-2" />
            Again
          </Button>
          <Button
            variant={difficulty === "good" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDifficulty("good")}
            className="text-yellow-600"
          >
            <Check className="h-4 w-4 mr-2" />
            Good
          </Button>
          <Button
            variant={difficulty === "easy" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDifficulty("easy")}
            className="text-green-600"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Easy
          </Button>
        </motion.div>
      )}
    </div>
  )
}

