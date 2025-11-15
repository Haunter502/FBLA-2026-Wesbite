'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface AnimatedQuizTestItemProps {
  id: string
  title: string
  description?: string | null
  href: string
  isCompleted: boolean
  score: number | null | undefined
  passed: boolean
  delay?: number
}

export function AnimatedQuizTestItem({ 
  id,
  title, 
  description,
  href,
  isCompleted,
  score,
  passed,
  delay = 0
}: AnimatedQuizTestItemProps) {
  const hasProgress = score !== null && score !== undefined
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ x: 4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
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
            <h3 className="font-semibold">{title}</h3>
            {isCompleted && (
              <span className="text-xs text-green-600 font-medium">Completed</span>
            )}
            {hasProgress && (
              <span className={`text-sm font-semibold ${
                passed ? 'text-green-600' : isCompleted ? 'text-orange-600' : 'text-blue-600'
              }`}>
                Score: {score}%
                {!isCompleted && ' (In Progress)'}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <Link href={href}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant={hasProgress ? "outline" : "default"}>
            {hasProgress ? (href.includes('/quizzes/') ? "Retake Quiz" : "Retake Test") : (href.includes('/quizzes/') ? "Start Quiz" : "Start Test")}
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  )
}

