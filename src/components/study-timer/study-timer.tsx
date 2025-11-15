'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Coffee, BookOpen, Timer, Brain, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConfettiEffect } from '@/components/animations/confetti-effect'
import { ParticleBackground } from '@/components/animations/particle-background'
import { GradientText } from '@/components/animations/gradient-text'
import { GlowEffect } from '@/components/animations/glow-effect'
import { FadeInUp } from '@/components/animations/fade-in-up'

type TimerMode = 'work' | 'shortBreak' | 'longBreak'

const WORK_DURATION = 25 * 60 // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60 // 5 minutes
const LONG_BREAK_DURATION = 15 * 60 // 15 minutes

export function StudyTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>('work')
  const [completedSessions, setCompletedSessions] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)
    if (mode === 'work') {
      setCompletedSessions((prev) => prev + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      
      // Auto-start break after work session
      if (completedSessions % 3 === 2) {
        setMode('longBreak')
        setTimeLeft(LONG_BREAK_DURATION)
      } else {
        setMode('shortBreak')
        setTimeLeft(SHORT_BREAK_DURATION)
      }
    } else {
      // Break completed, start work session
      setMode('work')
      setTimeLeft(WORK_DURATION)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentDuration = () => {
    if (mode === 'work') return WORK_DURATION
    if (mode === 'shortBreak') return SHORT_BREAK_DURATION
    return LONG_BREAK_DURATION
  }

  const currentDuration = getCurrentDuration()
  const progress = ((currentDuration - timeLeft) / currentDuration) * 100

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(mode === 'work' ? WORK_DURATION : mode === 'shortBreak' ? SHORT_BREAK_DURATION : LONG_BREAK_DURATION)
  }

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    if (newMode === 'work') {
      setTimeLeft(WORK_DURATION)
    } else if (newMode === 'shortBreak') {
      setTimeLeft(SHORT_BREAK_DURATION)
    } else {
      setTimeLeft(LONG_BREAK_DURATION)
    }
  }

  const getModeIcon = () => {
    switch (mode) {
      case 'work':
        return <Brain className="h-16 w-16 text-primary" />
      case 'shortBreak':
        return <Coffee className="h-16 w-16 text-primary" />
      case 'longBreak':
        return <Moon className="h-16 w-16 text-primary" />
    }
  }

  const getModeImage = () => {
    switch (mode) {
      case 'work':
        return '📚'
      case 'shortBreak':
        return '☕'
      case 'longBreak':
        return '🌙'
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Website color theme background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <ParticleBackground count={15} />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        <FadeInUp delay={0.1}>
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Timer className="h-10 w-10 text-primary" />
              </motion.div>
              <h1 className="text-5xl font-bold">
                <GradientText variant="primary" className="text-5xl md:text-6xl">
                  Study Timer
                </GradientText>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Pomodoro Technique - Focus and Rest</p>
          </div>
        </FadeInUp>

        <AnimatePresence>
          {showConfetti && <ConfettiEffect trigger={showConfetti} />}
        </AnimatePresence>

        <GlowEffect intensity="high">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background/95 to-secondary/5 backdrop-blur-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center">Session {completedSessions + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selector with Images */}
          <div className="flex justify-center gap-3">
            <motion.button
              onClick={() => switchMode('work')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                mode === 'work'
                  ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <div className="text-4xl">📚</div>
              <div className="font-semibold">Work</div>
            </motion.button>
            <motion.button
              onClick={() => switchMode('shortBreak')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                mode === 'shortBreak'
                  ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <div className="text-4xl">☕</div>
              <div className="font-semibold">Short Break</div>
            </motion.button>
            <motion.button
              onClick={() => switchMode('longBreak')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                mode === 'longBreak'
                  ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <div className="text-4xl">🌙</div>
              <div className="font-semibold">Long Break</div>
            </motion.button>
          </div>

          {/* Timer Display - Enhanced with website colors and mode image */}
          <div className="flex justify-center py-8">
            <div className="relative w-80 h-80">
              {/* Outer glow ring - website primary color */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: isRunning
                    ? [
                        '0 0 20px hsl(var(--primary) / 0.4)',
                        '0 0 40px hsl(var(--primary) / 0.6)',
                        '0 0 20px hsl(var(--primary) / 0.4)',
                      ]
                    : '0 0 20px hsl(var(--primary) / 0.2)',
                }}
                transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
                style={{ borderRadius: '50%' }}
              />
              <svg className="transform -rotate-90 w-full h-full">
                {/* Background circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-primary/20"
                />
                {/* Progress circle - primary gradient effect */}
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="50%" stopColor="hsl(var(--primary) / 0.8)" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="url(#timerGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  key={mode} // Re-animate when mode changes
                  initial={{ strokeDashoffset: 880 }}
                  animate={{
                    strokeDashoffset: 880 - (progress / 100) * 880,
                  }}
                  transition={{ duration: 1, ease: 'linear' }}
                  style={{
                    strokeDasharray: 880, // Circumference = 2 * π * 140 ≈ 880
                    filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.6))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Mode Image */}
                <motion.div
                  key={mode}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-6xl mb-2"
                >
                  {getModeImage()}
                </motion.div>
                {/* Time Display */}
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold text-primary"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                {/* Mode Label */}
                <motion.div
                  animate={{ opacity: isRunning ? [0.5, 1, 0.5] : 0.5 }}
                  transition={{ duration: 1.5, repeat: isRunning ? Infinity : 0 }}
                  className="mt-2 text-sm text-primary font-medium flex items-center gap-2"
                >
                  {getModeIcon()}
                  <span>{mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Controls - Enhanced with website primary colors */}
          <div className="flex justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={toggleTimer}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/50"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={resetTimer} 
                variant="outline" 
                size="lg"
                className="border-primary/50 hover:bg-primary/10 hover:border-primary"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </motion.div>
          </div>

          {/* Stats - Enhanced with website colors */}
          <div className="text-center pt-4 border-t border-primary/20">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Completed Sessions: <span className="font-semibold text-primary text-lg">{completedSessions}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </GlowEffect>
      </div>
    </div>
  )
}

