'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react'

interface AnimatedLessonItemProps {
  href: string
  lesson: {
    order: number
    title: string
    description: string
    duration?: number | null
  }
  isCompleted: boolean
  delay?: number
}

export function AnimatedLessonItem({ 
  href, 
  lesson, 
  isCompleted, 
  delay = 0 
}: AnimatedLessonItemProps) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover={{ x: 4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
          isCompleted ? 'border-green-500/50 bg-green-500/5' : ''
        }`}
      >
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
            <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{lesson.duration} min</span>
            </div>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </motion.div>
    </Link>
  )
}



